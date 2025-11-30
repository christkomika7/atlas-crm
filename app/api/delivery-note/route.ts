import { checkAccess, sessionAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId, getFirstValidCompanyId } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import Decimal from "decimal.js";
import { $Enums } from "@/lib/generated/prisma";
import { deliveryNoteSchema, DeliveryNoteSchemaType } from "@/lib/zod/delivery-note.schema";
import { checkAccessDeletion, rollbackDeliveryNote } from "@/lib/server";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { ItemType } from "@/types/item.type";

export async function POST(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "CREATE");
    const { userId } = await sessionAccess()

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];

    formData.forEach((value, key) => {
        if (key === "files" && value instanceof File) {
            files.push(value);
        }
        else {
            rawData[key] = value as string;
        }
    });

    const productServicesParse = JSON.parse(rawData.productServices);
    const billboardsParse = JSON.parse(rawData.billboards);

    const data = parseData<DeliveryNoteSchemaType>(deliveryNoteSchema, {
        ...rawData,
        totalHT: new Decimal(rawData.totalHT),
        totalTTC: new Decimal(rawData.totalTTC),
        amountType: rawData.amountType as 'TTC' | 'HT',
        deliveryNoteNumber: Number(rawData.deliveryNoteNumber),
        item: {
            productServices: productServicesParse?.map((b: ItemType) => ({
                id: "",
                name: b.name,
                reference: b.reference,
                hasTax: b.hasTax,
                description: b.description,
                quantity: b.quantity,
                locationStart: new Date(b.locationStart),
                locationEnd: new Date(b.locationEnd),
                price: new Decimal(b.price),
                updatedPrice: new Decimal(b.updatedPrice),
                currency: b.currency,
                discount: b.discount,
                discountType: b.discountType,
                itemType: b.itemType,
                productServiceId: b.productServiceId
            })) ?? [],
            billboards: billboardsParse?.map((b: ItemType) => ({
                id: "",
                name: b.name,
                reference: b.reference,
                hasTax: b.hasTax,
                quantity: b.quantity,
                description: b.description,
                locationStart: new Date(b.locationStart),
                locationEnd: new Date(b.locationEnd),
                price: new Decimal(b.price),
                updatedPrice: new Decimal(b.updatedPrice),
                currency: b.currency,
                discount: b.discount,
                discountType: b.discountType,
                itemType: b.itemType,
                billboardId: b.billboardId
            })) ?? [],
        },
        files,
    }) as DeliveryNoteSchemaType;

    const [companyExist, clientExist, projectExist, document] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
        prisma.client.findUnique({ where: { id: data.clientId } }),
        prisma.project.findUnique({ where: { id: data.projectId } }),
        prisma.documentModel.findFirst({ where: { companyId: data.companyId } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "L'identifiant de l'entreprise est introuvable.",
        }, { status: 404 });
    }
    if (!clientExist) {
        return NextResponse.json({
            status: "error",
            message: "L'identifiant du client est introuvable.",
        }, { status: 404 });
    }
    if (!projectExist) {
        return NextResponse.json({
            status: "error",
            message: "L'identifiant du projet est introuvable.",
        }, { status: 404 });
    }

    if (!document) {
        return NextResponse.json({
            status: "error",
            message: "Le modèle du document est introuvable.",
        }, { status: 404 });
    }

    const key = generateId();
    const deliveryNoteNumber = `${document?.deliveryNotesPrefix ?? DELIVERY_NOTE_PREFIX}-${data.deliveryNoteNumber}`;
    const folderFile = createFolder([companyExist.companyName, "delivery-note", `${deliveryNoteNumber}_----${key}/files`]);

    let savedFilePaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folderFile);
            savedFilePaths = [...savedFilePaths, upload];
        }

        const itemForCreate = [
            ...data.item.billboards?.map(billboard => ({
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                state: $Enums.ItemState.IGNORE,
                name: billboard.name,
                reference: billboard.reference,
                hasTax: billboard.hasTax,
                description: billboard.description ?? "",
                quantity: billboard.quantity,
                price: billboard.price,
                updatedPrice: billboard.updatedPrice,
                discount: billboard.discount ?? "0",
                locationStart: billboard.locationStart ?? new Date(),
                locationEnd: billboard.locationEnd ?? projectExist.deadline,
                discountType: billboard.discountType as string,
                currency: billboard.currency!,
                billboard: {
                    connect: {
                        id: billboard.billboardId
                    }
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...data.item.productServices?.map(productService => ({
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                state: $Enums.ItemState.IGNORE,
                reference: productService.reference,
                name: productService.name,
                hasTax: productService.hasTax,
                description: productService.description ?? "",
                quantity: productService.quantity,
                price: productService.price,
                updatedPrice: productService.updatedPrice,
                locationStart: new Date(),
                locationEnd: projectExist.deadline,
                discount: productService.discount ?? "0",
                discountType: productService.discountType as string,
                currency: productService.currency!,
                productService: {
                    connect: {
                        id: productService.productServiceId
                    }
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ]

        const [createdDeliveryNote] = await prisma.$transaction([
            prisma.deliveryNote.create({
                data: {
                    totalHT: data.totalHT,
                    discount: data.discount!,
                    discountType: data.discountType,
                    pathFiles: folderFile,
                    paymentLimit: data.paymentLimit,
                    totalTTC: data.totalTTC,
                    amountType: data.amountType,
                    note: data.note!,
                    files: savedFilePaths,
                    items: {
                        create: itemForCreate
                    },
                    project: {
                        connect: {
                            id: data.projectId
                        },

                    },
                    client: {
                        connect: {
                            id: data.clientId
                        }
                    },
                    company: {
                        connect: {
                            id: data.companyId
                        }
                    },
                    createdBy: {
                        connect: { id: userId as string }
                    },
                    billboards: {
                        connect: data.item.billboards?.map(billboard => ({
                            id: billboard.billboardId
                        })) ?? []
                    },
                    productsServices: {
                        connect: data.item.productServices?.map(productService => ({
                            id: productService.productServiceId
                        })) ?? []
                    },
                },
            }),
        ])

        return NextResponse.json({
            status: "success",
            message: "Bon de livraison créé avec succès.",
            data: createdDeliveryNote,
        });

    } catch (error) {
        await removePath([...savedFilePaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création du bon de livraison.",
        }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const deliveryNotes = await prisma.deliveryNote.findMany({
        where: { id: { in: ids } },
        include: {
            items: {
                where: {
                    state: "IGNORE"
                }
            },
            company: true
        }
    });

    const companyId = getFirstValidCompanyId(deliveryNotes);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    await checkAccessDeletion($Enums.DeletionType.DELIVERY_NOTES, ids, companyId)

    for (const deliveryNote of deliveryNotes) {
        if (deliveryNote.items && deliveryNote.items.length > 0) {
            await rollbackDeliveryNote(deliveryNote as unknown as DeliveryNoteType)
        }
        await prisma.$transaction([
            prisma.client.update({
                where: { id: deliveryNote.clientId as string },
                data: {
                    deliveryNotes: {
                        disconnect: {
                            id: deliveryNote.id
                        }
                    }
                }
            }),
            prisma.project.update({
                where: { id: deliveryNote.projectId as string },
                data: {
                    deliveryNotes: {
                        disconnect: {
                            id: deliveryNote.id
                        }
                    }
                }
            }),
            prisma.deliveryNote.delete({ where: { id: deliveryNote.id } })
        ]);
    }

    deliveryNotes.map(async deliveryNote => {
        await removePath([...deliveryNote.pathFiles])
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les bons de livraison sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}