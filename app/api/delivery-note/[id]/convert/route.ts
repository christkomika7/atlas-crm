import { DELIVERY_NOTE_PREFIX, INVOICE_PREFIX } from "@/config/constant";
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
    await checkAccess(["DELIVERY_NOTES"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;

    const updatedItems = await req.json();

    const deliveryNote = await prisma.deliveryNote.findUnique({
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

    if (!deliveryNote) return NextResponse.json({
        state: "error",
        message: "Aucun bon de livraison trouvé."
    }, { status: 400 })

    const lastDeliveryNote = await prisma.deliveryNote.findFirst({
        where: { companyId: deliveryNote.companyId },
        orderBy: { deliveryNoteNumber: "desc" },
        select: { deliveryNoteNumber: true },
    });

    const billboards: ItemType[] = (updatedItems as ItemType[]) ? updatedItems : deliveryNote.items.filter(it => it.itemType === "billboard");
    const conflictResult = await checkBillboardConflicts(billboards as unknown as BillboardItem[]);

    if (conflictResult.hasConflict) {
        return NextResponse.json({
            status: "error",
            message: "Conflit de dates détecté pour au moins un panneau.",
        }, { status: 404 });
    }

    const key = generateId();
    const invoiceNumber = `${deliveryNote.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${lastDeliveryNote?.deliveryNoteNumber || 1}`;
    const folderFile = createFolder([deliveryNote.company.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);
    let savedPaths: string[] = await copyTo(deliveryNote.files, folderFile);
    try {
        const amount = deliveryNote.amountType === "TTC" ? deliveryNote.totalTTC : deliveryNote.totalHT;

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
                    connect: { id: deliveryNote.companyId }
                },
                billboard: {
                    connect: { id: billboard.billboardId as string },
                },
                itemType: billboard.itemType ?? "billboard"
            })) ?? [],
            ...deliveryNote.items.filter(it => it.itemType !== "billboard").map(productService => ({
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
                    connect: { id: deliveryNote.companyId }
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
                    totalHT: deliveryNote.totalHT,
                    discount: deliveryNote.discount!,
                    discountType: deliveryNote.discountType,
                    pathFiles: folderFile,
                    amountType: deliveryNote.amountType,
                    paymentLimit: deliveryNote.paymentLimit,
                    fromRecordId: deliveryNote.id,
                    fromRecordName: "Bon de livraison",
                    fromRecordReference: `${deliveryNote.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(deliveryNote.deliveryNoteNumber, false)}`,
                    totalTTC: deliveryNote.totalTTC,
                    isPaid: false,
                    payee: new Decimal(0),
                    note: deliveryNote.note!,
                    files: savedPaths,
                    items: {
                        create: itemForCreate
                    },
                    project: {
                        connect: {
                            id: deliveryNote.projectId as string
                        },

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
                        connect: deliveryNote.items.filter(it => it.itemType === "billboard").map(billboard => ({
                            id: billboard.billboardId as string
                        })) ?? []
                    },
                    productsServices: {
                        connect: deliveryNote.items.filter(it => it.itemType !== "billboard").map(productService => ({
                            id: productService.productServiceId as string
                        })) ?? []
                    },
                },
            }),
            prisma.project.update({
                where: {
                    id: deliveryNote.projectId as string
                },
                data: { status: "TODO", amount }
            }),
            prisma.client.update({
                where: { id: deliveryNote.clientId as string },
                data: {
                    due: {
                        increment: amount
                    },
                    billboards: {
                        connect: [
                            ...deliveryNote.items.filter(it => it.itemType === "billboard").map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        ]
                    }
                }
            }),
            ...(deliveryNote.items.filter(it => it.itemType !== "billboard")?.map(productService => (
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
            prisma.deliveryNote.update({
                where: { id: deliveryNote.id },
                data: {
                    isCompleted: true
                }
            })
        ])

        return NextResponse.json({
            status: "success",
            message: "Le bon de livraison a été bien convertis en facture.",
            data: invoice.id,
        });

    } catch (error) {
        await removePath([...savedPaths])
        console.log({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la convertion du bon de livraison en facture.",
        }, { status: 500 });
    }
}

