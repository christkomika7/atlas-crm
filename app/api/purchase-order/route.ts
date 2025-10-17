import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { rollbackPurchaseOrder } from "@/lib/server";
import { generateId } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import Decimal from "decimal.js";
import { purchaseOrderSchema, PurchaseOrderSchemaType } from "@/lib/zod/purchase-order.schema";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { ItemPurchaseOrderSchemaType } from "@/lib/zod/item.schema";
import { $Enums } from "@/lib/generated/prisma";

export async function POST(req: NextRequest) {
    await checkAccess(["PURCHASE_ORDER"], "CREATE");

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

    const data = parseData<PurchaseOrderSchemaType>(purchaseOrderSchema, {
        ...rawData,
        totalHT: new Decimal(rawData.totalHT),
        totalTTC: new Decimal(rawData.totalTTC),
        payee: new Decimal(rawData.payee),
        amountType: rawData.amountType as 'TTC' | 'HT',
        purchaseOrderNumber: Number(rawData.purchaseOrderNumber),
        item: {
            productServices: productServicesParse?.map((b: ItemPurchaseOrderSchemaType) => ({
                id: "",
                name: b.name,
                hasTax: b.hasTax,
                quantity: b.quantity,
                description: b.description,
                selectedQuantity: b.selectedQuantity,
                status: b.status,
                price: new Decimal(b.price),
                updatedPrice: new Decimal(b.updatedPrice),
                currency: b.currency,
                discount: b.discount,
                discountType: b.discountType,
                itemType: b.itemType,
                productServiceId: b.productServiceId
            })) ?? [],
        },
        files,
    }) as PurchaseOrderSchemaType;

    const [companyExist, supplierExist, projectExist, document] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
        prisma.supplier.findUnique({ where: { id: data.supplierId } }),
        prisma.project.findUnique({ where: { id: data.projectId } }),
        prisma.documentModel.findFirst({ where: { companyId: data.companyId } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "L'identifiant de l'entreprise est introuvable.",
        }, { status: 404 });
    }
    if (!supplierExist) {
        return NextResponse.json({
            status: "error",
            message: "L'identifiant du fournisseur est introuvable.",
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
    const purchaseOrderNumber = `${document?.purchaseOrderPrefix ?? PURCHASE_ORDER_PREFIX}-${data.purchaseOrderNumber}`;
    const folderFile = createFolder([companyExist.companyName, "purchase-order", `${purchaseOrderNumber}_----${key}/files`]);

    let savedFilePaths: string[] = [];

    const itemForCreate = [
        ...data.item.productServices?.map(productService => ({
            company: {
                connect: {
                    id: data.companyId
                }
            },
            hasTax: productService.hasTax,
            state: $Enums.ItemState.PURCHASE,
            name: productService.name,
            description: productService.description,
            quantity: productService.selectedQuantity,
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

    try {
        for (const file of files) {
            const upload = await createFile(file, folderFile);
            savedFilePaths = [...savedFilePaths, upload];
        }

        const amount = data.amountType === "TTC" ? data.totalTTC : data.totalHT;

        const [createdPurchaseOrder] = await prisma.$transaction([
            prisma.purchaseOrder.create({
                data: {
                    totalHT: data.totalHT,
                    discount: data.discount!,
                    discountType: data.discountType,
                    pathFiles: folderFile,
                    amountType: data.amountType,
                    paymentLimit: data.paymentLimit,
                    totalTTC: data.totalTTC,
                    payee: data.payee,
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
                    supplier: {
                        connect: {
                            id: data.supplierId
                        }
                    },
                    company: {
                        connect: {
                            id: data.companyId
                        }
                    },
                    productsServices: {
                        connect: data.item.productServices?.map(productService => ({
                            id: productService.productServiceId
                        })) ?? []
                    },
                },
            }),
            prisma.supplier.update({
                where: { id: data.supplierId },
                data: {
                    due: {
                        increment: amount
                    }
                }
            }),
            ...(data.item.productServices?.map(productService => (
                prisma.productService.update({
                    where: {
                        id: productService.productServiceId
                    },
                    data: {
                        quantity: {
                            increment: productService.selectedQuantity
                        },
                    }
                })
            )) ?? [])
        ])

        return NextResponse.json({
            status: "success",
            message: "Bon de commande créé avec succès.",
            data: createdPurchaseOrder,
        });

    } catch (error) {
        await removePath([...savedFilePaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création du bon de commmande.",
        }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    await checkAccess(["PURCHASE_ORDER"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const purchaseOrders = await prisma.purchaseOrder.findMany({
        where: { id: { in: ids } },
        include: {
            items: true,
            dibursements: true,
        }
    })

    for (const purchaseOrder of purchaseOrders) {

        if (purchaseOrder.dibursements.length > 0) {
            return NextResponse.json({
                state: "error",
                message: "Supprimez d'abord les transactions associées à ce bon de commande.",
            }, { status: 409 });
        }

        if (purchaseOrder.items && purchaseOrder.items.length > 0) {
            await rollbackPurchaseOrder(purchaseOrder as unknown as PurchaseOrderType)
        }
        await prisma.$transaction([
            prisma.supplier.update({
                where: { id: purchaseOrder.supplierId as string },
                data: {
                    purchaseOrders: {
                        disconnect: {
                            id: purchaseOrder.id
                        }
                    },
                    due: {
                        decrement: purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC : purchaseOrder.totalHT
                    },
                    paidAmount: {
                        decrement: purchaseOrder.payee
                    }
                }
            }),
            prisma.project.update({
                where: { id: purchaseOrder.projectId as string },
                data: {
                    purchaseOrders: {
                        disconnect: {
                            id: purchaseOrder.id
                        }
                    },
                }
            }),
            prisma.purchaseOrder.delete({ where: { id: purchaseOrder.id } })
        ]);
    }

    purchaseOrders.map(async purchaseOrder => {
        await removePath([...purchaseOrder.pathFiles])
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les bons de commande sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}