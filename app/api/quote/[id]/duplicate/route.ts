import { QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { copyTo, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["QUOTES"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;

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

    const key = generateId();
    const quoteNumber = `${quote.company.documentModel?.quotesPrefix ?? QUOTE_PREFIX}-${lastQuote?.quoteNumber || 1}`;
    const folderFile = createFolder([quote.company.companyName, "quote", `${quoteNumber}_----${key}/files`]);
    let savedPaths: string[] = await copyTo(quote.files, folderFile);

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
                    note: quote.note!,
                    files: savedPaths,
                    items: {
                        createMany: {
                            data: [
                                ...quote.items.filter(it => it.itemType === "billboard")?.map(billboard => ({
                                    state: $Enums.ItemState.IGNORE,
                                    name: billboard.name,
                                    description: billboard.description ?? "",
                                    quantity: billboard.quantity,
                                    price: billboard.price,
                                    updatedPrice: billboard.updatedPrice,
                                    discount: billboard.discount ?? "0",
                                    locationStart: billboard.locationStart ?? new Date(),
                                    locationEnd: billboard.locationEnd,
                                    discountType: billboard.discountType as string,
                                    currency: billboard.currency!,
                                    billboardId: billboard.billboardId as string,
                                    itemType: billboard.itemType ?? "billboard"
                                })) ?? [],
                                ...quote.items.filter(it => it.itemType !== "billboard")?.map(productService => ({
                                    state: $Enums.ItemState.IGNORE,
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
                                    productServiceId: productService.productServiceId as string,
                                    itemType: productService.itemType ?? "product"
                                })) ?? []
                            ]
                        },
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
}