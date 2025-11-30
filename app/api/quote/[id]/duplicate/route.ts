import { DELIVERY_NOTE_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { generateAmaId, generateId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {

    const result = await checkAccess("QUOTES", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const data = await req.json();

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            client: true,
            productsServices: true,
            billboards: true,
            items: true,
            project: true,
            company: {
                include: {
                    documentModel: true
                }
            }
        }
    });

    if (!quote) return NextResponse.json({
        state: "error",
        message: "Aucun devis trouvé."
    }, { status: 400 })

    const lastQuote = await prisma.quote.findFirst({
        where: { companyId: quote.companyId },
        orderBy: { quoteNumber: "desc" },
        select: { quoteNumber: true },
    });

    if (data.duplicateTo === "quote") {
        const key = generateId();
        const quoteNumber = `${quote.company.documentModel?.quotesPrefix ?? QUOTE_PREFIX}-${lastQuote?.quoteNumber || 1}`;
        const folderFile = createFolder([quote.company.companyName, "quote", `${quoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(quote.files, folderFile);

        const itemForCreate = [
            ...quote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                state: $Enums.ItemState.IGNORE,
                name: billboard.name,
                reference: billboard.reference,

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
                    connect: { id: quote.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...quote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                state: $Enums.ItemState.IGNORE,
                name: productService.name,
                reference: productService.reference,
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
                    connect: { id: quote.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ]

        try {
            const [createdQuote] = await prisma.$transaction([
                prisma.quote.create({
                    data: {
                        totalHT: quote.totalHT,
                        discount: quote.discount!,
                        discountType: quote.discountType,
                        pathFiles: folderFile,
                        paymentLimit: quote.paymentLimit,
                        totalTTC: quote.totalTTC,
                        fromRecordId: quote.id,
                        fromRecordName: "Devis",
                        fromRecordReference: `${quote.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(quote.quoteNumber, false)}`,
                        amountType: quote.amountType,
                        note: quote.note!,
                        files: savedPaths,
                        items: {
                            create: itemForCreate
                        },
                        project: {
                            connect: {
                                id: quote.projectId as string
                            },

                        },
                        client: {
                            connect: {
                                id: quote.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: quote.companyId
                            }
                        },
                        billboards: {
                            connect: quote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: quote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Devis dupliqué avec succès.",
                data: createdQuote,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la duplication du devis.",
            }, { status: 500 });

        }

    } else {

        const itemForCreate = [
            ...quote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                state: $Enums.ItemState.IGNORE,
                name: billboard.name,
                description: billboard.description ?? "",
                quantity: billboard.quantity,
                reference: billboard.reference,
                price: billboard.price,
                hasTax: billboard.hasTax,
                updatedPrice: billboard.updatedPrice,
                discount: billboard.discount ?? "0",
                locationStart: billboard.locationStart,
                locationEnd: billboard.locationEnd,
                discountType: billboard.discountType as string,
                currency: billboard.currency!,
                company: {
                    connect: { id: quote.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...quote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                state: $Enums.ItemState.IGNORE,
                name: productService.name,
                description: productService.description ?? "",
                quantity: productService.quantity,
                reference: productService.reference,
                price: productService.price,
                hasTax: productService.hasTax,
                updatedPrice: productService.updatedPrice,
                locationStart: new Date(),
                locationEnd: new Date(),
                discount: productService.discount ?? "0",
                discountType: productService.discountType as string,
                currency: productService.currency!,
                company: {
                    connect: { id: quote.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ]

        const key = generateId();
        const deliveryNoteNumber = `${quote.company.documentModel?.deliveryNotesPrefix ?? DELIVERY_NOTE_PREFIX}-${lastQuote?.quoteNumber || 1}`;
        const folderFile = createFolder([quote.company.companyName, "delivery-note", `${deliveryNoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(quote.files, folderFile);
        try {
            const [createdDeliveryNote] = await prisma.$transaction([
                prisma.deliveryNote.create({
                    data: {
                        totalHT: quote.totalHT,
                        discount: quote.discount!,
                        discountType: quote.discountType,
                        pathFiles: folderFile,
                        paymentLimit: quote.paymentLimit,
                        totalTTC: quote.totalTTC,
                        amountType: quote.amountType,
                        note: quote.note!,
                        files: savedPaths,
                        fromRecordId: quote.id,
                        fromRecordName: "Devis",
                        fromRecordReference: `${quote.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(quote.quoteNumber, false)}`,
                        items: {
                            create: itemForCreate
                        },
                        project: {
                            connect: {
                                id: quote.projectId as string
                            },

                        },
                        client: {
                            connect: {
                                id: quote.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: quote.companyId
                            }
                        },
                        billboards: {
                            connect: quote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: quote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Le devis a été convertis en bon de livraison avec succès.",
                data: createdDeliveryNote.id,
            });
        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la convertion du devis en bon de livraison.",
            }, { status: 500 });
        }
    }

}