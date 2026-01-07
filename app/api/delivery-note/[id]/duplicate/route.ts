import { DELIVERY_NOTE_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { generateAmaId, generateId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, 2) as string;

    const data = await req.json();

    const deliveryNote = await prisma.deliveryNote.findUnique({
        where: { id },
        include: {
            client: true,
            productsServices: true,
            billboards: true,
            items: true,
            company: {
                include: {
                    documentModel: true
                }
            }
        }
    });

    if (!deliveryNote) return NextResponse.json({
        state: "error",
        message: "Aucun bon de livraison trouvé."
    }, { status: 400 })

    const lastDeliveryNote = await prisma.deliveryNote.findFirst({
        where: { companyId: deliveryNote.companyId },
        orderBy: { deliveryNoteNumber: "desc" },
        select: { deliveryNoteNumber: true },
    });

    if (data.duplicateTo === "delivery-note") {
        const key = generateId();
        const deliveryNoteNumber = `${deliveryNote.company.documentModel?.deliveryNotesPrefix ?? DELIVERY_NOTE_PREFIX}-${lastDeliveryNote?.deliveryNoteNumber || 1}`;
        const folderFile = createFolder([deliveryNote.company.companyName, "delivery-note", `${deliveryNoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(deliveryNote.files, folderFile);

        try {

            const itemForCreate = [
                ...deliveryNote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                    state: $Enums.ItemState.IGNORE,
                    reference: billboard.reference,
                    name: billboard.name,
                    hasTax: billboard.hasTax,
                    description: billboard.description ?? "",
                    quantity: billboard.quantity,
                    price: billboard.price,
                    updatedPrice: billboard.updatedPrice,
                    discount: billboard.discount ?? "0",
                    locationStart: billboard.locationStart,
                    locationEnd: billboard.locationEnd,
                    discountType: billboard.discountType as string,
                    currency: billboard.currency!,
                    company: {
                        connect: { id: deliveryNote.companyId }
                    },
                    billboard: {
                        connect: { id: billboard.billboardId as string },
                    },
                    itemType: billboard.itemType ?? "billboard"
                })) ?? [],
                ...deliveryNote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                    state: $Enums.ItemState.IGNORE,
                    reference: productService.reference,
                    name: productService.name,
                    hasTax: productService.hasTax,
                    description: productService.description ?? "",
                    quantity: productService.quantity,
                    price: productService.price,
                    updatedPrice: productService.updatedPrice,
                    locationStart: new Date(),
                    locationEnd: new Date(),
                    discount: productService.discount ?? "0",
                    discountType: productService.discountType as string,
                    currency: productService.currency!,
                    company: {
                        connect: { id: deliveryNote.companyId }
                    },
                    productService: {
                        connect: { id: productService.productServiceId as string },
                    },
                    itemType: productService.itemType ?? "product"
                })) ?? []
            ]

            const [createdDeliveryNote] = await prisma.$transaction([
                prisma.deliveryNote.create({
                    data: {
                        totalHT: deliveryNote.totalHT,
                        discount: deliveryNote.discount!,
                        discountType: deliveryNote.discountType,
                        pathFiles: folderFile,
                        fromRecordId: deliveryNote.id,
                        fromRecordName: "Bon de livraison",
                        fromRecordReference: `${deliveryNote.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(deliveryNote.deliveryNoteNumber, false)}`,
                        paymentLimit: deliveryNote.paymentLimit,
                        totalTTC: deliveryNote.totalTTC,
                        note: deliveryNote.note!,
                        files: savedPaths,
                        items: {
                            create: itemForCreate
                        },
                        client: {
                            connect: {
                                id: deliveryNote.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: deliveryNote.companyId
                            }
                        },
                        billboards: {
                            connect: deliveryNote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: deliveryNote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Bon de livraison dupliqué avec succès.",
                data: createdDeliveryNote,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la duplication du bon de livraison.",
            }, { status: 500 });

        }
    } else {
        const key = generateId();
        const deliveryNoteNumber = `${deliveryNote.company.documentModel?.quotesPrefix ?? QUOTE_PREFIX}-${lastDeliveryNote?.deliveryNoteNumber || 1}`;
        const folderFile = createFolder([deliveryNote.company.companyName, "quote", `${deliveryNoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(deliveryNote.files, folderFile);

        try {

            const itemForCreate = [
                ...deliveryNote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                    state: $Enums.ItemState.IGNORE,
                    name: billboard.name,
                    reference: billboard.reference,
                    description: billboard.description ?? "",
                    quantity: billboard.quantity,
                    price: billboard.price,
                    updatedPrice: billboard.updatedPrice,
                    discount: billboard.discount ?? "0",
                    locationStart: billboard.locationStart,
                    locationEnd: billboard.locationEnd,
                    discountType: billboard.discountType as string,
                    currency: billboard.currency!,
                    company: {
                        connect: { id: deliveryNote.companyId }
                    },
                    billboard: {
                        connect: { id: billboard.billboardId as string },
                    },
                    itemType: billboard.itemType ?? "billboard"
                })) ?? [],
                ...deliveryNote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                    state: $Enums.ItemState.IGNORE,
                    reference: productService.reference,
                    name: productService.name,
                    description: productService.description ?? "",
                    quantity: productService.quantity,
                    price: productService.price,
                    updatedPrice: productService.updatedPrice,
                    locationStart: new Date(),
                    locationEnd: new Date(),
                    discount: productService.discount ?? "0",
                    discountType: productService.discountType as string,
                    currency: productService.currency!,
                    company: {
                        connect: { id: deliveryNote.companyId }
                    },
                    productService: {
                        connect: { id: productService.productServiceId as string },
                    },
                    itemType: productService.itemType ?? "product"
                })) ?? []
            ]

            const [createdDeliveryNote] = await prisma.$transaction([
                prisma.quote.create({
                    data: {
                        totalHT: deliveryNote.totalHT,
                        discount: deliveryNote.discount!,
                        discountType: deliveryNote.discountType,
                        pathFiles: folderFile,
                        paymentLimit: deliveryNote.paymentLimit,
                        totalTTC: deliveryNote.totalTTC,
                        note: deliveryNote.note!,
                        files: savedPaths,
                        fromRecordId: deliveryNote.id,
                        fromRecordName: "Bon de livraison",
                        fromRecordReference: `${deliveryNote.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(deliveryNote.deliveryNoteNumber, false)}`,
                        items: {
                            create: itemForCreate
                        },
                        client: {
                            connect: {
                                id: deliveryNote.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: deliveryNote.companyId
                            }
                        },
                        billboards: {
                            connect: deliveryNote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: deliveryNote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Bon de livraison converti en devis avec succès.",
                data: createdDeliveryNote.id,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la convertion en devis du bon de livraison.",
            }, { status: 500 });

        }
    }

}