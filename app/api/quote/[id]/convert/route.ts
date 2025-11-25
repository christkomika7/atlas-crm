import { INVOICE_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { checkBillboardConflicts } from "@/lib/server";
import { generateAmaId, generateId, getIdFromUrl } from "@/lib/utils";
import { ItemType } from "@/stores/item.store";
import { BillboardItem } from "@/types/invoice.types";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("QUOTES", "CREATE");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const updatedItems = await req.json();

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

    const billboards: ItemType[] = (updatedItems as ItemType[]) ? updatedItems : quote.items.filter(it => it.itemType === "billboard");
    const conflictResult = await checkBillboardConflicts(billboards as unknown as BillboardItem[]);

    if (conflictResult.hasConflict) {
        return NextResponse.json({
            status: "error",
            message: "Conflit de dates détecté pour au moins un panneau.",
        }, { status: 404 });
    }

    const key = generateId();
    const invoiceNumber = `${quote.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${lastQuote?.quoteNumber || 1}`;
    const folderFile = createFolder([quote.company.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);
    let savedPaths: string[] = await copyTo(quote.files, folderFile);
    try {
        const amount = quote.amountType === "TTC" ? quote.totalTTC : quote.totalHT;

        const itemForCreate = [
            ...billboards.map(billboard => ({
                state: $Enums.ItemState.APPROVED,
                name: billboard.name,
                reference: billboard.reference,
                description: billboard.description ?? "",
                quantity: billboard.quantity,
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
            ...quote.items.filter(it => it.itemType !== "billboard").map(productService => ({
                state: $Enums.ItemState.APPROVED,
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
                    connect: { id: quote.companyId }
                },
                productService: {
                    connect: { id: productService.productServiceId as string },
                },
                itemType: productService.itemType ?? "product"
            })) ?? []
        ];

        const [invoice] = await prisma.$transaction([
            prisma.invoice.create({
                data: {
                    totalHT: quote.totalHT,
                    discount: quote.discount!,
                    discountType: quote.discountType,
                    pathFiles: folderFile,
                    amountType: quote.amountType,
                    paymentLimit: quote.paymentLimit,
                    fromRecordId: quote.id,
                    fromRecordName: "Devis",
                    fromRecordReference: `${quote.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(quote.quoteNumber, false)}`,
                    totalTTC: quote.totalTTC,
                    isPaid: false,
                    payee: new Decimal(0),
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
                        connect: quote.items.filter(it => it.itemType === "billboard").map(billboard => ({
                            id: billboard.billboardId as string
                        })) ?? []
                    },
                    productsServices: {
                        connect: quote.items.filter(it => it.itemType !== "billboard").map(productService => ({
                            id: productService.productServiceId as string
                        })) ?? []
                    },
                },
            }),
            prisma.project.update({
                where: {
                    id: quote.projectId as string
                },
                data: { status: "TODO", amount }
            }),
            prisma.client.update({
                where: { id: quote.clientId as string },
                data: {
                    due: {
                        increment: amount
                    },
                    billboards: {
                        connect: [
                            ...quote.items.filter(it => it.itemType === "billboard").map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        ]
                    }
                }
            }),
            ...(quote.items.filter(it => it.itemType !== "billboard")?.map(productService => (
                prisma.productService.update({
                    where: {
                        id: productService.productServiceId as string
                    },
                    data: {
                        quantity: {
                            decrement: productService.quantity
                        },
                    }
                })
            )) ?? []),
            prisma.quote.update({
                where: { id: quote.id },
                data: {
                    isCompleted: true
                }
            })
        ])

        return NextResponse.json({
            status: "success",
            message: "Le devis a été bien convertis en facture.",
            data: invoice.id,
        });

    } catch (error) {
        await removePath([...savedPaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la convertion du devis en facture.",
        }, { status: 500 });
    }
}

