import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../prisma"
import { generateId } from "../utils";
import { INVOICE_PREFIX } from "@/config/constant";
import { copyTo, createFolder } from "../file";

type NotifyRecurrenceProps = {
    repeat: "no" | "day" | "week" | "2-week" | "month" | "2-month" | "quarter" | "semester" | "year";

}

export async function notifyRecurrence(data: NotifyRecurrenceProps) {
    const recurrences = await prisma.recurrence.findMany({
        where: { repeat: data.repeat }
    })


    for (const recurrence of recurrences) {
        const invoiceId = recurrence.id;
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                items: true,
                client: true,
                project: true,
                productsServices: true,
                billboards: true,
                company: {
                    include: {
                        documentModel: true
                    }
                }
            }
        });

        if (invoice) {
            const key = generateId();
            const invoiceNumber = `${invoice.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${invoice.invoiceNumber}`;
            const folderFile = createFolder([invoice.company.companyName, "invoice", `${invoiceNumber}_----${key}/files`]);
            let savedFilePaths: string[] = await copyTo(invoice.files, folderFile);

            const itemForCreate = [
                ...invoice.items.filter(i => i.itemType === "billboard").map(billboard => ({
                    name: billboard.name,
                    reference: billboard.reference,
                    hasTax: billboard.hasTax,
                    description: billboard.description ?? "",
                    quantity: billboard.quantity,
                    price: billboard.price,
                    updatedPrice: billboard.updatedPrice,
                    discount: billboard.discount ?? "0",
                    locationStart: billboard.locationStart ?? new Date(),
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
                ...invoice.items.filter(i => i.itemType !== "billboard")?.map(productService => ({
                    name: productService.name,
                    description: productService.description ?? "",
                    reference: productService.reference,
                    hasTax: productService.hasTax,
                    quantity: productService.quantity,
                    price: productService.price,
                    updatedPrice: productService.updatedPrice,
                    locationStart: productService.locationStart,
                    locationEnd: productService.locationEnd,
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
            ]

            await prisma.$transaction([
                prisma.invoice.create({
                    data: {
                        files: savedFilePaths,
                        pathFiles: folderFile,
                        totalHT: invoice.totalHT,
                        discount: invoice.discount,
                        discountType: invoice.discountType,
                        paymentLimit: invoice.paymentLimit,
                        totalTTC: invoice.totalTTC,
                        payee: invoice.payee,
                        note: invoice.note,
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
                                id: invoice.companyId as string
                            }
                        },
                        billboards: {
                            connect: invoice.items.filter(i => i.itemType === "billboard" && Boolean(i.billboardId)).map(billboard => ({
                                id: billboard.billboardId as string
                            })) ?? []
                        },
                        productsServices: {
                            connect: invoice.items.filter(i => i.itemType !== "billboard" && Boolean(i.productServiceId)).map(productService => ({
                                id: productService.productServiceId as string
                            })) ?? []
                        },

                    }
                }),
                prisma.project.update({
                    where: {
                        id: invoice.projectId as string
                    },
                    data: { status: "TODO", amount: new Decimal(invoice.totalTTC) }
                }),
                prisma.client.update({
                    where: { id: invoice.clientId as string },
                    data: {
                        due: {
                            increment: new Decimal(invoice.totalTTC)
                        },
                        billboards: {
                            connect: [
                                ...invoice.items.filter(i => i.itemType === "billboard" && Boolean(i.billboardId)).map(billboard => ({
                                    id: billboard.billboardId as string
                                })) ?? []
                            ]
                        }
                    }
                }),
                ...(invoice.items.filter(i => i.itemType !== "billboard" && Boolean(i.productServiceId)).map(productService => (
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
                )) ?? [])
            ]);
        }
    }


}