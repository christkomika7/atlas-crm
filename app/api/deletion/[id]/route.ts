import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { $Enums } from "@/lib/generated/prisma";
import { DELIVERY_NOTE_PREFIX, INVOICE_PREFIX, PURCHASE_ORDER_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { DeletionType } from "@/types/deletion.types";
import { removePath } from "@/lib/file";
import { rollbackDeliveryNote, rollbackInvoice, rollbackPurchaseOrder, rollbackQuote } from "@/lib/server";
import { QuoteType } from "@/types/quote.types";
import { InvoiceType } from "@/types/invoice.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export async function GET(req: NextRequest) {
    const session = await getSession();
    const id = getIdFromUrl(req.url, "last") as string;

    const type = req.nextUrl.searchParams.get("type")?.trim() as $Enums.DeletionType;

    if (session && session.user.role !== "ADMIN") {
        return NextResponse.json({
            status: "error",
            message: "Acces refusé.",
        }, { status: 404 });
    }

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    if (!type) {
        return NextResponse.json({
            state: "error",
            message: "Filtre invalide.",
        }, { status: 400 })
    }

    switch (type) {
        case "QUOTES":
            const deletionQuotes = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                },
                include: {
                    user: true
                }
            });

            let transformQuote: DeletionType[] = [];
            for (const deletion of deletionQuotes) {
                const quote = await prisma.quote.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!quote) {
                    continue
                }
                const amount = quote.amountType === "TTC" ? quote.totalTTC : quote.totalHT;
                transformQuote = [...transformQuote, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: `${quote?.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(quote?.quoteNumber, false)}`,
                    date: deletion.createdAt,
                    actionBy: deletion.user?.name || "Inconnu",
                    forUser: `${quote.client?.companyName}`,
                    amount: `${formatNumber(new Decimal(amount.toString()))} ${quote.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformQuote,
            }, { status: 200 });

        case "INVOICES":
            const deletionInvoices = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformInvoices: DeletionType[] = [];
            for (const deletion of deletionInvoices) {
                const invoice = await prisma.invoice.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!invoice) {
                    continue
                }
                const amount = invoice.amountType === "TTC" ? invoice.totalTTC : invoice.totalHT;
                transformInvoices = [...transformInvoices, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: `${invoice?.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice?.invoiceNumber, false)}`,
                    date: deletion.createdAt,
                    forUser: `${invoice.client?.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(new Decimal(amount.toString()))} ${invoice.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformInvoices,
            }, { status: 200 });

        case "DELIVERY_NOTES":
            const deletionDeliveryNotes = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformDeliveryNotes: DeletionType[] = [];
            for (const deletion of deletionDeliveryNotes) {
                const deliveryNote = await prisma.deliveryNote.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!deliveryNote) {
                    continue
                }
                const amount = deliveryNote.amountType === "TTC" ? deliveryNote.totalTTC : deliveryNote.totalHT;
                transformDeliveryNotes = [...transformDeliveryNotes, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: `${deliveryNote?.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(deliveryNote?.deliveryNoteNumber, false)}`,
                    date: deletion.createdAt,
                    forUser: `${deliveryNote.client?.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(new Decimal(amount.toString()))} ${deliveryNote.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformDeliveryNotes,
            }, { status: 200 });

        case "PURCHASE_ORDERS":
            const deletionPurchaseOrders = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformPurchaseOrders: DeletionType[] = [];
            for (const deletion of deletionPurchaseOrders) {
                const purchaseOrder = await prisma.purchaseOrder.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        supplier: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!purchaseOrder) {
                    continue
                }
                const amount = purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC : purchaseOrder.totalHT;
                transformPurchaseOrders = [...transformPurchaseOrders, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: `${purchaseOrder?.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder?.purchaseOrderNumber, false)}`,
                    date: deletion.createdAt,
                    forUser: `${purchaseOrder.supplier?.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(new Decimal(amount.toString()))} ${purchaseOrder.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformPurchaseOrders,
            }, { status: 200 });

        case "RECEIPTS":
            const deletionReceipts = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                },
                include: {
                    user: true
                }
            });

            let transformReceipts: DeletionType[] = [];
            for (const deletion of deletionReceipts) {
                const receipt = await prisma.receipt.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        referenceInvoice: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!receipt) {
                    continue
                }

                transformReceipts = [...transformReceipts, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: `${receipt.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(receipt.referenceInvoice?.invoiceNumber || 0, false)}`,
                    date: deletion.createdAt,
                    actionBy: deletion.user?.name || "Inconnu",
                    forUser: `${receipt.client?.companyName}`,
                    amount: `${formatNumber(new Decimal(receipt.amount.toString()))} ${receipt.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformReceipts,
            }, { status: 200 });

        case "DISBURSEMENTS":
            const deletionDisbursement = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }
                , include: {
                    user: true
                }
            });

            let transformDisbursement: DeletionType[] = [];
            let index = 1;
            for (const deletion of deletionDisbursement) {
                const dibursement = await prisma.dibursement.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        suppliers: true,
                        referencePurchaseOrder: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!dibursement) {
                    continue
                }

                transformDisbursement = [...transformDisbursement, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: dibursement.referencePurchaseOrder ? `${dibursement.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(dibursement.referencePurchaseOrder?.purchaseOrderNumber || 0, false)}` : index.toString(),
                    date: deletion.createdAt,
                    actionBy: deletion.user?.name || "Inconnu",
                    forUser: `${dibursement.suppliers[0]?.companyName || "-"}`,
                    amount: `${formatNumber(new Decimal(dibursement.amount.toString()))} ${dibursement.company.currency}`
                }];
                index++
            }

            return NextResponse.json({
                state: "success",
                data: transformDisbursement,
            }, { status: 200 });

        case "PRODUCT_SERVICES":
            const deletionProductServices = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformProductServices: DeletionType[] = [];
            for (const deletion of deletionProductServices) {
                const productService = await prisma.productService.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!productService) {
                    continue
                }

                transformProductServices = [...transformProductServices, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: productService.reference,
                    date: deletion.createdAt,
                    categorie: productService.category,
                    actionBy: deletion.user?.name || "Inconnu",
                    designation: productService.designation,
                    price: `${formatNumber(new Decimal(productService.cost.toString()))} ${productService.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformProductServices,
            }, { status: 200 });

        case "BILLBOARDS":
            const deletionBillboards = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformBillboards: DeletionType[] = [];
            for (const deletion of deletionBillboards) {
                const billboard = await prisma.billboard.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        type: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!billboard) {
                    continue
                }

                transformBillboards = [...transformBillboards, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: billboard.reference,
                    date: deletion.createdAt,
                    categorie: billboard.type.name,
                    designation: billboard.name,
                    actionBy: deletion.user?.name || "Inconnu",
                    price: `${formatNumber(new Decimal(billboard.rentalPrice.toString()))} ${billboard.company.currency}`
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformBillboards,
            }, { status: 200 });

        case "CLIENTS":
            const deletionClients = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformClient: DeletionType[] = [];
            for (const deletion of deletionClients) {
                const client = await prisma.client.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!client) {
                    continue
                }

                transformClient = [...transformClient, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: '',
                    date: deletion.createdAt,
                    forUser: `${client.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(client.paidAmount.toString())} ${client.company.currency}`,
                    due: `${formatNumber(client.due.toString())} ${client.company.currency}`,
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformClient,
            }, { status: 200 });

        case "SUPPLIERS":
            const deletionSuppliers = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformSuppliers: DeletionType[] = [];
            for (const deletion of deletionSuppliers) {
                const supplier = await prisma.supplier.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!supplier) {
                    continue
                }

                transformSuppliers = [...transformSuppliers, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: '',
                    date: deletion.createdAt,
                    forUser: `${supplier.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(supplier.paidAmount.toString())} ${supplier.company.currency}`,
                    due: `${formatNumber(supplier.due.toString())} ${supplier.company.currency}`,
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformSuppliers,
            }, { status: 200 });

        case "PROJECTS":
            const deletionProjects = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformProjects: DeletionType[] = [];
            for (const deletion of deletionProjects) {
                const project = await prisma.project.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!project) {
                    continue
                }

                transformProjects = [...transformProjects, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: '',
                    date: deletion.createdAt,
                    forUser: `${project.client.companyName}`,
                    actionBy: deletion.user?.name || "Inconnu",
                    amount: `${formatNumber(project.amount.toString())} ${project.company.currency}`,
                    due: `${formatNumber(project.balance.toString())} ${project.company.currency}`,
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformProjects,
            }, { status: 200 });

        case "CONTRACT":
            const deletionContracts = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformContracts: DeletionType[] = [];
            for (const deletion of deletionContracts) {
                const contract = await prisma.contract.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        lessor: true,
                        billboard: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!contract) {
                    continue
                }

                const forUser = contract.type === "CLIENT" ? `${contract.client?.lastname} ${contract.client?.firstname}` :
                    contract.type === "LESSOR" && contract.lessor ? `${contract.lessor?.lastname} ${contract.lessor?.firstname}` :
                        `${contract.billboard?.lessorName}`

                transformContracts = [...transformContracts, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: '',
                    categorie: contract.type === "CLIENT" ? "Client" : "Bailleur",
                    date: deletion.createdAt,
                    actionBy: deletion.user?.name || "Inconnu",
                    forUser,
                }];

            }

            return NextResponse.json({
                state: "success",
                data: transformContracts,
            }, { status: 200 });

        case "APPOINTMENTS":
            const deletionAppointment = await prisma.deletion.findMany({
                where: {
                    type: type as $Enums.DeletionType,
                    companyId: id,
                    isValidate: false
                }, include: {
                    user: true
                }
            });

            let transformAppointments: DeletionType[] = [];
            for (const deletion of deletionAppointment) {
                const appointment = await prisma.appointment.findUnique({
                    where: { id: deletion.recordId },
                    include: {
                        client: true,
                        company: {
                            include: { documentModel: true }
                        }
                    }
                });

                if (!appointment) {
                    continue
                }

                transformAppointments = [...transformAppointments, {
                    id: deletion.id,
                    recordId: deletion.recordId,
                    reference: '',
                    date: deletion.createdAt,
                    actionBy: deletion.user?.name || "Inconnu",
                    forUser: `${appointment.client.companyName}`,
                }];
            }

            return NextResponse.json({
                state: "success",
                data: transformAppointments,
            }, { status: 200 });
    }

}


export async function PUT(req: NextRequest) {
    const session = await getSession();
    const id = getIdFromUrl(req.url, "last") as string;

    const recordId = req.nextUrl.searchParams.get("recordId")?.trim();
    const type = req.nextUrl.searchParams.get("type")?.trim() as $Enums.DeletionType;
    const action = req.nextUrl.searchParams.get("action")?.trim() as "cancel" | "delete";

    if (session && session.user.role !== "ADMIN") {
        return NextResponse.json({
            status: "error",
            message: "Acces refusé.",
        }, { status: 404 });
    }

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    if (!type && !action) {
        return NextResponse.json({
            state: "error",
            message: "Filtre invalide.",
        }, { status: 400 })
    }

    switch (type) {
        case "QUOTES":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.quote.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const quote = await prisma.quote.findUnique({
                        where: { id: recordId },
                        include: {
                            items: {
                                where: {
                                    state: "IGNORE"
                                }
                            },
                            billboards: true,
                            productsServices: true,
                            company: true
                        }
                    });

                    if (!quote) {
                        return NextResponse.json({
                            message: "Devis introuvable.",
                            state: "error",
                        }, { status: 400 })
                    }

                    if (quote?.items && quote?.items.length > 0) {
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
                        prisma.quote.delete({ where: { id: recordId } })
                    ]);

                    await removePath([...quote.pathFiles]);
                    await prisma.deletion.delete({ where: { id } });
                    break;
            }
            break;

        case "INVOICES":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.invoice.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const invoice = await prisma.invoice.findUnique({
                        where: { id: recordId },
                        include: {
                            items: {
                                where: {
                                    state: "APPROVED"
                                }
                            },
                            billboards: true,
                            productsServices: true,
                            receipts: true,
                            payments: true,
                            company: true
                        }
                    });

                    if (!invoice) {
                        return NextResponse.json({
                            message: "Facture introuvable.",
                            state: "error",
                        }, { status: 400 })
                    }

                    if (invoice.receipts.length > 0 || invoice.payments.length > 0) {
                        return NextResponse.json({
                            state: "error",
                            message: "Supprimez d'abord les transactions et paiements associés à cette facture.",
                        }, { status: 409 });
                    }

                    if (invoice?.items && invoice?.items.length > 0) {
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
                        prisma.invoice.delete({ where: { id: recordId } })
                    ]);

                    await removePath([...invoice.pathFiles]);
                    await prisma.$transaction([
                        prisma.deletion.delete({ where: { id } }),
                        prisma.receipt.deleteMany({ where: { referenceInvoiceId: invoice.id } }),
                        prisma.payment.deleteMany({ where: { invoiceId: invoice.id } }),
                    ]);

                    break;
            }
            break;

        case "DELIVERY_NOTES":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.deliveryNote.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const deliveryNote = await prisma.deliveryNote.findUnique({
                        where: { id: recordId },
                        include: {
                            items: {
                                where: {
                                    state: "IGNORE"
                                }
                            },
                            billboards: true,
                            productsServices: true,
                            company: true
                        }
                    });

                    if (!deliveryNote) {
                        return NextResponse.json({
                            message: "Bon de livraison introuvable.",
                            state: "error",
                        }, { status: 400 })
                    }

                    if (deliveryNote?.items && deliveryNote?.items.length > 0) {
                        await rollbackDeliveryNote(deliveryNote as unknown as DeliveryNoteType)
                    }

                    await prisma.$transaction([
                        prisma.client.update({
                            where: { id: deliveryNote.clientId as string },
                            data: {
                                deliveryNotes: {
                                    disconnect: {
                                        id: deliveryNote.id
                                    }
                                }
                            }
                        }),
                        prisma.deliveryNote.delete({ where: { id: recordId } })
                    ]);

                    await removePath([...deliveryNote.pathFiles]);
                    await prisma.deletion.delete({ where: { id } });

                    break;
            }
            break;

        case "PURCHASE_ORDERS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.purchaseOrder.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const purchaseOrder = await prisma.purchaseOrder.findUnique({
                        where: { id: recordId },
                        include: {
                            items: true,
                            productsServices: true,
                            payments: true,
                            dibursements: true,
                            company: true
                        }
                    });

                    if (!purchaseOrder) {
                        return NextResponse.json({
                            message: "Bon de commande introuvable.",
                            state: "error",
                        }, { status: 400 })
                    }

                    if (purchaseOrder.dibursements.length > 0 || purchaseOrder.payments.length > 0) {
                        return NextResponse.json({
                            state: "error",
                            message: "Supprimez d'abord les transactions et paiements associés à ce bon de commande.",
                        }, { status: 409 });
                    }

                    if (purchaseOrder?.items && purchaseOrder?.items.length > 0) {
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
                                }
                            }
                        }),
                        prisma.purchaseOrder.delete({ where: { id: recordId } }),
                        prisma.payment.deleteMany({ where: { purchaseOrderId: recordId } }),
                        prisma.dibursement.deleteMany({ where: { referencePurchaseOrderId: recordId } })
                    ]);

                    await removePath([...purchaseOrder.pathFiles]);
                    await prisma.deletion.delete({ where: { id } });

                    break;
            }
            break;

        case "RECEIPTS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.receipt.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    await prisma.$transaction(async (tx) => {
                        const receiptExist = await tx.receipt.findUnique({
                            where: { id: recordId }, include: {
                                referenceInvoice: {
                                    include: {
                                        client: true,
                                        project: true
                                    }
                                },
                                payment: true,
                            }
                        });

                        if (!receiptExist) {
                            throw new Error("Identifiant de l'encaissement invalide.");
                        }

                        const amount = receiptExist.amount || new Decimal(0);

                        if (receiptExist.referenceInvoice) {
                            const invoice = receiptExist.referenceInvoice;
                            await tx.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    isPaid: false,
                                    payee: {
                                        decrement: amount
                                    }
                                }
                            });

                            if (invoice.clientId) {
                                await tx.client.update({
                                    where: { id: invoice.clientId },
                                    data: {
                                        due: { increment: amount },
                                        paidAmount: { decrement: amount }
                                    }
                                })
                            }

                            if (invoice.projectId) {
                                await tx.project.update({
                                    where: { id: invoice.projectId },
                                    data: {
                                        balance: {
                                            decrement: amount
                                        }
                                    }
                                })
                            }
                        }

                        if (receiptExist.payment) {
                            await tx.payment.delete({ where: { id: receiptExist.payment.id } });
                        }

                        await tx.receipt.delete({ where: { id: recordId } })
                        await tx.deletion.delete({ where: { id } });
                    })
                    break;
            }
            break;

        case "DISBURSEMENTS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.dibursement.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    await prisma.$transaction(async (tx) => {

                        const disbursementExist = await tx.dibursement.findUnique({
                            where: { id: recordId }, include: {
                                referencePurchaseOrder: {
                                    include: {
                                        supplier: true
                                    }
                                },
                                payment: true,
                            }
                        });

                        if (!disbursementExist) {
                            throw new Error("Identifiant du décaissement invalide.");
                        }

                        const amount = disbursementExist.amount || new Decimal(0);

                        if (disbursementExist.referencePurchaseOrder) {
                            const purchaseOrder = disbursementExist.referencePurchaseOrder;
                            await tx.purchaseOrder.update({
                                where: { id: purchaseOrder.id },
                                data: {
                                    isPaid: false,
                                    payee: {
                                        decrement: amount
                                    }
                                }
                            });

                            if (purchaseOrder.supplier) {
                                await tx.supplier.update({
                                    where: { id: purchaseOrder.supplier.id },
                                    data: {
                                        due: { increment: amount },
                                        paidAmount: { decrement: amount }
                                    }
                                })
                            }
                        }

                        if (disbursementExist.payment) {
                            await tx.payment.delete({ where: { id: disbursementExist.payment.id } });
                        }
                        await tx.dibursement.delete({ where: { id: recordId } })

                        await tx.deletion.delete({ where: { id } });
                    })

                    break;
            }
            break;

        case "PRODUCT_SERVICES":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.productService.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    await prisma.productService.delete({
                        where: { id: recordId },
                    });
                    await prisma.deletion.delete({ where: { id } });
                    break;
            }
            break;

        case "BILLBOARDS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.billboard.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const billboard = await prisma.billboard.delete({
                        where: { id: recordId },
                    });
                    await prisma.deletion.delete({ where: { id } });

                    await removePath([billboard.pathBrochure, billboard.pathPhoto]);

                    break;
            }
            break;

        case "CLIENTS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.client.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const client = await prisma.client.delete({
                        where: { id: recordId },
                        include: {
                            invoices: true,
                            projects: true,
                            receipts: true,
                            contracts: true,
                            deliveryNotes: true,
                            quotes: true,
                            appointments: true,
                        }
                    });

                    if (
                        client.invoices.length > 0 ||
                        client.projects.length > 0 ||
                        client.receipts.length > 0 ||
                        client.contracts.length > 0 ||
                        client.quotes.length > 0 ||
                        client.deliveryNotes.length > 0 ||
                        client.appointments.length > 0
                    ) {
                        return NextResponse.json({
                            state: "error",
                            message: "Supprimez d'abord les transactions, factures, devis, bon de livraisons, contrats, projets et rendez-vous associés à ce client.",
                        }, { status: 409 });
                    }
                    await prisma.deletion.delete({ where: { id } });
                    await removePath(client.uploadDocuments);
                    break;
            }
            break;

        case "CONTRACT":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.contract.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    await prisma.contract.delete({
                        where: { id: recordId },
                    });
                    await prisma.deletion.delete({ where: { id } });

                    break;
            }
            break;

        case "SUPPLIERS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.supplier.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const supplier = await prisma.supplier.delete({
                        where: { id: recordId },
                        include: {
                            dibursements: true,
                            contracts: true,
                            purchaseOrders: true
                        }
                    });

                    if (
                        supplier.dibursements.length > 0 ||
                        supplier.contracts.length > 0
                    ) {
                        return NextResponse.json({
                            state: "error",
                            message: "Supprimez d'abord les transactions, bon de commandes et contrats associés à ce fournisseur.",
                        }, { status: 409 });
                    }

                    await prisma.deletion.delete({ where: { id } });
                    await removePath(supplier.uploadDocuments);
                    break;
            }
            break;

        case "PROJECTS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.project.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const project = await prisma.project.delete({
                        where: { id: recordId },
                        include: {
                            invoices: true,
                            purchaseOrders: true,
                            dibursements: true,
                            tasks: true
                        }
                    });

                    if (
                        project.invoices.length > 0 ||
                        project.purchaseOrders.length > 0 ||
                        project.dibursements.length > 0 ||
                        project.tasks.length > 0
                    ) {
                        return NextResponse.json({
                            state: "error",
                            message: "Supprimez d'abord les transactions, factures, bon de commandes et tâches associés à ce projet.",
                        }, { status: 409 });
                    }

                    await prisma.deletion.delete({ where: { id } });
                    await removePath([project.path]);
                    break;
            }
            break;

        case "APPOINTMENTS":
            switch (action) {
                case "cancel":
                    await prisma.$transaction([
                        prisma.appointment.update({
                            where: { id: recordId },
                            data: {
                                hasDelete: false
                            }
                        }),
                        prisma.deletion.delete({ where: { id } })
                    ]);

                    break
                case "delete":
                    const appointment = await prisma.appointment.delete({
                        where: { id: recordId },
                    });
                    await prisma.deletion.delete({ where: { id } });
                    await removePath([appointment.path]);
                    break;
            }
            break;
    }

    return NextResponse.json({
        state: "success",
        message: "La requete à été examiné avec succes",
    }, { status: 200 });

}

