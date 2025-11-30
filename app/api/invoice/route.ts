import { checkAccess, sessionAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion, checkBillboardConflicts, rollbackInvoice } from "@/lib/server";
import { generateId, getFirstValidCompanyId } from "@/lib/utils";
import { invoiceSchema, InvoiceSchemaType } from "@/lib/zod/invoice.schema";
import { NextResponse, type NextRequest } from "next/server";
import { InvoiceType } from "@/types/invoice.types";
import Decimal from "decimal.js";
import { toUtcDateOnly } from "@/lib/date";
import { $Enums } from "@/lib/generated/prisma";
import { ItemType } from "@/types/item.type";

export async function POST(req: NextRequest) {
    const result = await checkAccess("INVOICES", "CREATE");
    const { userId } = await sessionAccess();

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

    const data = parseData<InvoiceSchemaType>(invoiceSchema, {
        ...rawData,
        totalHT: new Decimal(rawData.totalHT),
        totalTTC: new Decimal(rawData.totalTTC),
        payee: new Decimal(rawData.payee),
        amountType: rawData.amountType as 'TTC' | 'HT',
        invoiceNumber: Number(rawData.invoiceNumber),
        item: {
            productServices: productServicesParse?.map((b: ItemType) => ({
                id: "",
                name: b.name,
                reference: b.reference,
                hasTax: b.hasTax,
                quantity: b.quantity,
                description: b.description,
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
                reference: b.reference,
                hasTax: b.hasTax,
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
    }) as InvoiceSchemaType;

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

    const billboards = data.item.billboards ?? [];
    const conflictResult = await checkBillboardConflicts(billboards);

    if (conflictResult.hasConflict) {
        return NextResponse.json({
            status: "error",
            message: "Conflit de dates détecté pour au moins un panneau.",
        }, { status: 404 });
    }

    const key = generateId();
    const invoiceNumber = `${document?.invoicesPrefix ?? "Facture"}-${data.invoiceNumber}`;
    const folderFile = createFolder([companyExist.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);

    let savedFilePaths: string[] = [];

    try {
        for (const file of files) {
            const upload = await createFile(file, folderFile);
            savedFilePaths = [...savedFilePaths, upload];
        }

        const amount = data.amountType === "TTC" ? data.totalTTC : data.totalHT;

        const itemForCreate = [
            ...data.item.billboards?.map(billboard => ({
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                reference: billboard.reference,
                state: $Enums.ItemState.APPROVED,
                name: billboard.name,
                hasTax: billboard.hasTax,
                description: billboard.description,
                quantity: billboard.quantity,
                price: billboard.price,
                updatedPrice: billboard.updatedPrice,
                discount: billboard.discount ?? "0",
                locationStart: billboard.locationStart,
                locationEnd: billboard.locationEnd,
                discountType: billboard.discountType as string,
                currency: billboard.currency!,
                billboard: {
                    connect: {
                        id: billboard.billboardId
                    }
                },
                itemType: billboard.itemType ?? "billboard",

            })) ?? [],
            ...data.item.productServices?.map(productService => ({
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                reference: productService.reference,
                state: $Enums.ItemState.APPROVED,
                name: productService.name,
                hasTax: productService.hasTax,
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
            })) ?? []
        ];

        const [createdInvoice] = await prisma.$transaction([
            prisma.invoice.create({
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
                    createdBy: {
                        connect: { id: userId as string }
                    },
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
            prisma.project.update({
                where: {
                    id: projectExist.id
                },
                data: { status: "TODO", amount }
            }),
            prisma.client.update({
                where: { id: data.clientId },
                data: {
                    due: {
                        increment: amount
                    },
                    billboards: {
                        connect: [
                            ...data.item.billboards?.map(billboard => ({
                                id: billboard.billboardId
                            })) ?? []
                        ]
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
        await removePath([...savedFilePaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de la facture.",
        }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("INVOICES", "MODIFY");

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

    const invoices = await prisma.invoice.findMany({
        where: { id: { in: ids } },
        include: {
            items: {
                where: {
                    state: "APPROVED"
                }
            },
            receipts: true,
            dibursements: true,
            company: true
        }
    });

    const companyId = getFirstValidCompanyId(invoices);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });


    await checkAccessDeletion($Enums.DeletionType.INVOICES, ids, companyId);

    for (const invoice of invoices) {
        if (invoice.receipts.length > 0 || invoice.dibursements.length > 0) {
            return NextResponse.json({
                state: "error",
                message: "Supprimez d'abord les transactions associées à cette facture.",
            }, { status: 409 });
        }
        if (invoice.items && invoice.items.length > 0) {
            await rollbackInvoice(invoice as unknown as InvoiceType)
        }
        await prisma.$transaction([
            prisma.client.update({
                where: { id: invoice.clientId as string },
                data: {
                    invoices: {
                        disconnect: {
                            id: invoice.id
                        }
                    },
                    due: {
                        decrement: invoice.amountType === "TTC" ? invoice.totalTTC : invoice.totalHT
                    },
                    paidAmount: {
                        decrement: invoice.payee
                    }
                }
            }),
            prisma.project.update({
                where: { id: invoice.projectId as string },
                data: {
                    invoices: {
                        disconnect: {
                            id: invoice.id
                        }
                    },
                    status: "BLOCKED",
                    amount: new Decimal(0),
                    balance: new Decimal(0)
                }
            }),
            prisma.invoice.delete({ where: { id: invoice.id } })
        ]);
    }

    invoices.map(async invoice => {
        await removePath([...invoice.pathFiles])
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les factures sélectionnées ont été supprimées avec succès.",
    }, { status: 200 })

}