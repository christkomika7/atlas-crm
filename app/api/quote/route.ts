import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { quoteSchema, QuoteSchemaType } from "@/lib/zod/quote.schema";
import { QUOTE_PREFIX } from "@/config/constant";
import Decimal from "decimal.js";
import { $Enums } from "@/lib/generated/prisma";
import { QuoteType } from "@/types/quote.types";
import { rollbackQuote } from "@/lib/server";
import { toUtcDateOnly } from "@/lib/date";
import { ItemType } from "@/types/item.type";

export async function POST(req: NextRequest) {
    await checkAccess(["QUOTES"], "CREATE");

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

    const data = parseData<QuoteSchemaType>(quoteSchema, {
        ...rawData,
        totalHT: new Decimal(rawData.totalHT),
        totalTTC: new Decimal(rawData.totalTTC),
        quoteNumber: Number(rawData.quoteNumber),
        amountType: rawData.amountType as 'TTC' | 'HT',
        item: {
            productServices: productServicesParse?.map((b: ItemType) => ({
                id: "",
                name: b.name,
                description: b.description,
                quantity: b.quantity,
                locationStart: toUtcDateOnly(b.locationStart),
                locationEnd: toUtcDateOnly(b.locationEnd),
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
                description: b.description,
                quantity: b.quantity,
                locationStart: toUtcDateOnly(b.locationStart),
                locationEnd: toUtcDateOnly(b.locationEnd),
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
    }) as QuoteSchemaType;

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
    const quoteNumber = `${document?.quotesPrefix ?? QUOTE_PREFIX}-${data.quoteNumber}`;
    const folderFile = createFolder([companyExist.companyName, "quote", `${quoteNumber}_----${key}/files`]);

    let savedFilePaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folderFile);
            savedFilePaths = [...savedFilePaths, upload];
        }

        const itemForCreate = [
            ...data.item.billboards?.map(billboard => ({
                state: $Enums.ItemState.IGNORE,
                name: billboard.name,
                description: billboard.description,
                quantity: billboard.quantity,
                price: billboard.price,
                updatedPrice: billboard.updatedPrice,
                discount: billboard.discount ?? "0",
                locationStart: billboard.locationStart,
                locationEnd: billboard.locationEnd ?? projectExist.deadline,
                discountType: billboard.discountType as string,
                currency: billboard.currency!,
                billboard: {
                    connect: {
                        id: billboard.billboardId
                    }
                },
                itemType: billboard.itemType ?? "billboard",
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
            })) ?? [],
            ...data.item.productServices?.map(productService => ({
                state: $Enums.ItemState.IGNORE,
                name: productService.name,
                description: productService.description,
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
                itemType: productService.itemType ?? "product",
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
            })) ?? []
        ]

        const [createdQuote] = await prisma.$transaction([
            prisma.quote.create({
                data: {
                    totalHT: data.totalHT,
                    discount: data.discount!,
                    discountType: data.discountType,
                    pathFiles: folderFile,
                    paymentLimit: data.paymentLimit,
                    totalTTC: data.totalTTC,
                    note: data.note!,
                    amountType: data.amountType,
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
            message: "Devis créé avec succès.",
            data: createdQuote,
        });

    } catch (error) {
        await removePath([...savedFilePaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création du devis.",
        }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    await checkAccess(["QUOTES"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const quotes = await prisma.quote.findMany({
        where: { id: { in: ids } },
        include: {
            items: {
                where: {
                    state: "IGNORE"
                }
            }
        }
    })

    for (const quote of quotes) {
        if (quote.items && quote.items.length > 0) {
            await rollbackQuote(quote as unknown as QuoteType)
        }
        await prisma.$transaction([
            prisma.client.update({
                where: { id: quote.clientId as string },
                data: {
                    quotes: {
                        disconnect: {
                            id: quote.id
                        }
                    }
                }
            }),
            prisma.project.update({
                where: { id: quote.projectId as string },
                data: {
                    quotes: {
                        disconnect: {
                            id: quote.id
                        }
                    }
                }
            }),
            prisma.quote.delete({ where: { id: quote.id } })
        ]);
    }

    quotes.map(async quote => {
        await removePath([...quote.pathFiles])
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les devis sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}