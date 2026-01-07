import { DELIVERY_NOTE_PREFIX, INVOICE_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { checkBillboardConflicts } from "@/lib/server";
import { generateAmaId, generateId, getIdFromUrl } from "@/lib/utils";
import { ItemType } from "@/stores/item.store";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("INVOICES", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, 2) as string;

    const updatedItems = await req.json();
    const type = req.nextUrl.searchParams.get("type")?.trim() ?? "" as "invoice" | "quote" | "delivery-note" | undefined;

    const invoice = await prisma.invoice.findUnique({
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

    if (!invoice) return NextResponse.json({
        state: "error",
        message: "Aucune facture trouvée."
    }, { status: 400 })

    if (!invoice?.projectId) {
        throw new Error("La facture doit être liée à un projet pour pouvoir être dupliquée.");
    }

    if (!type || type === "invoice") {
        const lastInvoice = await prisma.invoice.findFirst({
            where: { companyId: invoice.companyId },
            orderBy: { invoiceNumber: "desc" },
            select: { invoiceNumber: true },
        });

        const key = generateId();
        const invoiceNumber = `${invoice.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${lastInvoice?.invoiceNumber || 1}`;
        const folderFile = createFolder([invoice.company.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(invoice.files, folderFile);



        const billboards: ItemType[] = (updatedItems as ItemType[]) ? updatedItems : invoice.items.filter(it => it.itemType === "billboard");
        const conflictResult = await checkBillboardConflicts(billboards);

        if (conflictResult.hasConflict) {
            return NextResponse.json({
                status: "error",
                message: "Conflit de dates détecté pour au moins un panneau.",
            }, { status: 404 });
        }


        const itemForCreate = [
            ...billboards.map(billboard => ({
                state: $Enums.ItemState.APPROVED,
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
                    connect: { id: invoice.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                state: $Enums.ItemState.APPROVED,
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
                    connect: { id: invoice.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ];

        try {
            const [createdInvoice] = await prisma.$transaction([
                prisma.invoice.create({
                    data: {
                        totalHT: invoice.totalHT,
                        discount: invoice.discount!,
                        discountType: invoice.discountType,
                        pathFiles: folderFile,
                        paymentLimit: invoice.paymentLimit,
                        totalTTC: invoice.totalTTC,
                        amountType: invoice.amountType,
                        note: invoice.note!,
                        fromRecordId: invoice.id,
                        fromRecordName: "Facture",
                        fromRecordReference: `${invoice.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}`,
                        isPaid: false,
                        payee: new Decimal(0),
                        files: savedPaths,
                        items: {
                            create: itemForCreate
                        },
                        project: {
                            connect: {
                                id: invoice.projectId as string
                            },

                        },
                        client: {
                            connect: {
                                id: invoice.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: invoice.companyId
                            }
                        },
                        billboards: {
                            connect: invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Facture dupliquée avec succès.",
                data: createdInvoice,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la duplication de la facture.",
            }, { status: 500 });

        }
    }

    if (type === "quote") {
        const lastQuote = await prisma.quote.findFirst({
            where: { companyId: invoice.companyId },
            orderBy: { quoteNumber: "desc" },
            select: { quoteNumber: true },
        });

        const key = generateId();
        const quoteNumber = `${invoice.company.documentModel?.quotesPrefix ?? QUOTE_PREFIX}-${lastQuote?.quoteNumber || 1}`;
        const folderFile = createFolder([invoice.company.companyName, "quote", `${quoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(invoice.files, folderFile);

        const itemForCreate = [
            ...invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
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
                    connect: { id: invoice.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
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
                    connect: { id: invoice.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ];

        try {
            const [createdQuote] = await prisma.$transaction([
                prisma.quote.create({
                    data: {
                        totalHT: invoice.totalHT,
                        discount: invoice.discount!,
                        discountType: invoice.discountType,
                        pathFiles: folderFile,
                        paymentLimit: invoice.paymentLimit,
                        totalTTC: invoice.totalTTC,
                        amountType: invoice.amountType,
                        note: invoice.note!,
                        files: savedPaths,
                        fromRecordId: invoice.id,
                        fromRecordName: "Facture",
                        fromRecordReference: `${invoice.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}`,
                        items: {
                            create: itemForCreate
                        },
                        client: {
                            connect: {
                                id: invoice.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: invoice.companyId
                            }
                        },
                        billboards: {
                            connect: invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Facture dupliquée avec succès.",
                data: createdQuote,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la duplication de la facture.",
            }, { status: 500 });

        }
    }

    if (type === "delivery-note") {
        const lastDeliveryNote = await prisma.deliveryNote.findFirst({
            where: { companyId: invoice.companyId },
            orderBy: { deliveryNoteNumber: "desc" },
            select: { deliveryNoteNumber: true },
        });

        const key = generateId();
        const deliveryNoteNumber = `${invoice.company.documentModel?.deliveryNotesPrefix ?? DELIVERY_NOTE_PREFIX}-${lastDeliveryNote?.deliveryNoteNumber || 1}`;
        const folderFile = createFolder([invoice.company.companyName, "delivery-note", `${deliveryNoteNumber}_----${key}/files`]);
        let savedPaths: string[] = await copyTo(invoice.files, folderFile);

        const itemForCreate = [
            ...invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
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
                    connect: { id: invoice.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
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
                    connect: { id: invoice.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ];

        try {
            const [createdDeliveryNote] = await prisma.$transaction([
                prisma.deliveryNote.create({
                    data: {
                        totalHT: invoice.totalHT,
                        discount: invoice.discount!,
                        discountType: invoice.discountType,
                        pathFiles: folderFile,
                        paymentLimit: invoice.paymentLimit,
                        totalTTC: invoice.totalTTC,
                        amountType: invoice.amountType,
                        note: invoice.note!,
                        files: savedPaths,
                        fromRecordId: invoice.id,
                        fromRecordName: "Facture",
                        fromRecordReference: `${invoice.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}`,
                        items: {
                            create: itemForCreate
                        },
                        client: {
                            connect: {
                                id: invoice.clientId as string
                            }
                        },
                        company: {
                            connect: {
                                id: invoice.companyId
                            }
                        },
                        billboards: {
                            connect: invoice.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: invoice.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },
                    },
                }),
            ])

            return NextResponse.json({
                status: "success",
                message: "Facture dupliquée avec succès.",
                data: createdDeliveryNote,
            });

        } catch (error) {
            await removePath([...savedPaths])
            console.log({ error });

            return NextResponse.json({
                status: "error",
                message: "Erreur lors de la duplication de la facture.",
            }, { status: 500 });

        }
    }



}