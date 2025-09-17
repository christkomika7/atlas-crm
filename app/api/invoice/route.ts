import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { invoiceSchema, InvoiceSchemaType } from "@/lib/zod/invoice.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "CREATE");

    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];
    const photos: File[] = [];

    formData.forEach((value, key) => {
        if (key === "files" && value instanceof File) {
            files.push(value);
        }
        else if (key === "photos" && value instanceof File) {
            photos.push(value)
        }
        else {
            rawData[key] = value as string;
        }
    });

    const productServicesParse = JSON.parse(rawData.productServices);
    const billboardsParse = JSON.parse(rawData.billboards);

    const data = parseData<InvoiceSchemaType>(invoiceSchema, {
        ...rawData,
        item: {
            productServices: productServicesParse,
            billboards: billboardsParse?.map((b: { id: string; name: string; quantity: number; locationStart: string; locationEnd: string; status: string; price: string; updatedPrice: string; discount: string; currency: string; discountType: any; itemType: any; billboardId: string; }) => ({
                id: b.id,
                name: b.name,
                quantity: b.quantity,
                locationStart: new Date(b.locationStart),
                locationEnd: new Date(b.locationEnd),
                status: b.status,
                price: b.price,
                updatedPrice: b.updatedPrice,
                currency: b.currency,
                discount: b.discount,
                discountType: b.discountType,
                itemType: b.itemType,
                billboardId: b.billboardId
            })) ?? [],
        },
        files,
        photos
    }) as InvoiceSchemaType;


    const [companyExist, clientExist, projectExist, document, lastInvoice] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
        prisma.client.findUnique({ where: { id: data.clientId } }),
        prisma.project.findUnique({ where: { id: data.projectId } }),
        prisma.documentModel.findFirst({ where: { companyId: data.companyId } }),
        prisma.invoice.findFirst({
            where: { companyId: data.companyId },
            orderBy: { invoiceNumber: "desc" },
            select: { invoiceNumber: true },
        })
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

    const billboards = data.item.billboards ?? [];

    const billboardIds = billboards.map(b => b.billboardId).filter((id): id is string => id !== undefined);

    const existingItems = await prisma.item.findMany({
        where: {
            billboardId: { in: billboardIds },
        },
    });

    const conflicts = billboards.map(billboard => {
        return existingItems.find(existing => {
            if (existing.billboardId !== billboard.billboardId) return false;

            const newStart = billboard.locationStart;
            const newEnd = billboard.locationEnd;
            const oldStart = existing.locationStart;
            const oldEnd = existing.locationEnd;

            return (
                newStart &&
                newEnd &&
                oldStart &&
                oldEnd &&
                !(oldEnd < newStart || oldStart > newEnd)
            );
        });
    });

    if (conflicts.some(c => c !== undefined)) {
        return NextResponse.json({
            status: "error",
            message: "Conflit de dates détecté pour au moins un panneau.",
        }, { status: 404 });
    }

    const key = generateId();
    const invoiceNumber = `${document?.invoicesPrefix ?? "Facture"}-${lastInvoice?.invoiceNumber ? lastInvoice.invoiceNumber + 1 : 1}`;
    const folderPhoto = createFolder([companyExist.companyName, "invoice", `${invoiceNumber}_----${key}/photos`]);
    const folderFile = createFolder([companyExist.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);

    let savedFilePaths: string[] = [];
    let savedPhotoPaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folderFile);
            savedFilePaths = [...savedFilePaths, upload];

        }

        for (const photo of photos) {
            const upload = await createFile(photo, folderPhoto);
            savedPhotoPaths = [...savedPhotoPaths, upload];
        }


        const [createdInvoice] = await prisma.$transaction([
            prisma.invoice.create({
                data: {
                    totalHT: data.totalHT,
                    discount: data.discount!,
                    discountType: data.discountType,
                    pathFiles: folderFile,
                    pathPhotos: folderPhoto,
                    totalTTC: data.totalTTC,
                    payee: data.payee!,
                    note: data.note!,
                    photos: savedPhotoPaths,
                    files: savedFilePaths,
                    items: {
                        createMany: {
                            data: [
                                ...data.item.billboards?.map(billboard => ({
                                    name: billboard.name,
                                    description: billboard.description ?? "",
                                    quantity: billboard.quantity,
                                    price: billboard.price,
                                    updatedPrice: billboard.updatedPrice,
                                    discount: billboard.discount!,
                                    locationStart: billboard.locationStart ?? new Date(),
                                    locationEnd: billboard.locationEnd ?? projectExist.deadline,
                                    discountType: billboard.discountType as string,
                                    currency: billboard.currency!,
                                    billboardId: billboard.billboardId,
                                    itemType: billboard.itemType ?? "billboard"
                                })) ?? [],
                                ...data.item.productServices?.map(productService => ({
                                    name: productService.name,
                                    description: productService.description ?? "",
                                    quantity: productService.quantity,
                                    price: productService.price,
                                    updatedPrice: productService.updatedPrice,
                                    locationStart: new Date(),
                                    locationEnd: projectExist.deadline,
                                    discount: productService.discount!,
                                    discountType: productService.discountType as string,
                                    currency: productService.currency!,
                                    productServiceId: productService.productServiceId,
                                    itemType: productService.itemType ?? "product"
                                })) ?? []
                            ]
                        },
                    },
                    project: {
                        connect: {
                            id: data.projectId
                        }
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
            prisma.project.update({
                where: {
                    id: projectExist.id
                },
                data: { status: "TODO" }
            }),
            prisma.client.update({
                where: { id: data.clientId },
                data: {
                    billboards: {
                        connect: [
                            ...data.item.billboards?.map(billboard => ({
                                id: billboard.billboardId
                            })) ?? []
                        ]
                    }
                }
            }),
            ...(data.item.billboards?.map(billboard => (
                prisma.billboard.update({
                    where: {
                        id: billboard.billboardId
                    },
                    data: {
                        locationStart: new Date(),
                        locationEnd: projectExist.deadline,
                    }
                })
            )) ?? []),
            ...(data.item.productServices?.map(productService => (
                prisma.productService.update({
                    where: {
                        id: productService.productServiceId
                    },
                    data: {
                        quantity: {
                            decrement: productService.quantity
                        },
                    }
                })
            )) ?? [])
        ])

        return NextResponse.json({
            status: "success",
            message: "Facture crée avec succès.",
            data: createdInvoice,
        });

    } catch (error) {
        await removePath([...savedFilePaths, ...savedPhotoPaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de la facture.",
        }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    await checkAccess(["INVOICES"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const invoices = await prisma.invoice.findMany({
        where: { id: { in: ids } }
    })

    await prisma.invoice.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    invoices.map(async invoice => {
        await removePath([...invoice.pathFiles, ...invoice.pathPhotos])
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les factures sélectionnées ont été supprimées avec succès.",
    }, { status: 200 })

}