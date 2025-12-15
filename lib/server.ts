'use server';
import path from "path";
import fs from "fs-extra";
import mime from "mime-types";
import prisma from "./prisma";
import { BillboardItem, ConflictResult, ExistingBillboardItem, InvoiceType } from "@/types/invoice.types";
import { differenceInDays, endOfMonth, endOfQuarter, endOfYear, format, isAfter, isBefore, isEqual, isValid, startOfMonth, startOfQuarter, startOfYear, subMonths, subYears } from "date-fns";
import { QuoteType } from "@/types/quote.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { getSession } from "./auth";
import { $Enums } from "./generated/prisma";
import { NextResponse } from "next/server";
import { PeriodType, ReportType } from "@/types/company.types";
import { Decimal } from "decimal.js";
import { formatDecimal } from "./utils";


export async function getFileFromPath(filePath: string): Promise<File | null> {
    try {
        // Nettoyage éventuel du chemin (en cas de préfixe erroné)
        const cleanPath = filePath.replace(/^uploads[\/\\]?/, "");

        // Point ici vers "uploads" et non "public"
        const fullPath = path.join(process.cwd(), "uploads", cleanPath);

        const buffer = await fs.readFile(fullPath);
        const uint8Array = new Uint8Array(buffer);

        const type = mime.lookup(fullPath) || "application/octet-stream";
        const name = path.basename(fullPath);

        return new File([uint8Array], name, { type });
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier:", err);
        return null;
    }
}

export async function rollbackInvoice(
    invoiceExist: InvoiceType,
) {
    const productsServices = invoiceExist.productsServices || [];
    const billboards = invoiceExist.billboards || [];

    // Regrouper les quantités à réincrémenter pour chaque productService
    const productServiceItems = invoiceExist.items
        .filter(
            (it: any) => it.itemType !== "billboard" && it.productServiceId
        )
        .reduce<Record<string, number>>((acc, it) => {
            const key = String(it.productServiceId); // toujours en string
            acc[key] = (acc[key] || 0) + it.quantity;
            return acc;
        }, {});

    // 🔎 Logs de debug
    console.log("🔎 Quantités à rollback:", productServiceItems);
    console.log(
        "🔎 IDs attendus:",
        productsServices.map((ps: any) => String(ps.id))
    );

    const productServiceUpdates = productsServices.map((productService: any) =>
        prisma.productService.update({
            where: { id: String(productService.id) },
            data: {
                quantity: {
                    increment: productServiceItems[String(productService.id)] || 0,
                },
            },
        })
    );

    await prisma.$transaction([
        // supprimer les items liés à la facture
        prisma.item.deleteMany({ where: { invoiceId: invoiceExist.id } }),

        // déconnecter les relations avec la facture
        prisma.invoice.update({
            where: { id: invoiceExist.id },
            data: {
                productsServices: {
                    disconnect: productsServices.map((ps: any) => ({ id: ps.id })),
                },
                billboards: {
                    disconnect: billboards.map((b: any) => ({ id: b.id })),
                },
            },
        }),

        // mettre à jour les stocks
        ...productServiceUpdates,
    ]);
}

export async function rollbackPurchaseOrder(
    purchaseOrderExist: PurchaseOrderType,
) {
    const productsServices = purchaseOrderExist.productsServices || [];

    // Regrouper les quantités à réincrémenter pour chaque productService
    const productServiceItems = purchaseOrderExist.items
        .reduce<Record<string, number>>((acc, it) => {
            const key = String(it.productServiceId); // toujours en string
            acc[key] = (acc[key] || 0) + it.quantity;
            return acc;
        }, {});

    // 🔎 Logs de debug
    console.log("🔎 Quantités à rollback:", productServiceItems);
    console.log(
        "🔎 IDs attendus:",
        productsServices.map((ps: any) => String(ps.id))
    );

    const productServiceUpdates = productsServices.map((productService: any) =>
        prisma.productService.update({
            where: { id: String(productService.id) },
            data: {
                quantity: {
                    decrement: productServiceItems[String(productService.id)] || 0,
                },
            },
        })
    );

    await prisma.$transaction([
        // supprimer les items liés à la facture
        prisma.item.deleteMany({ where: { purchaseOrderId: purchaseOrderExist.id } }),

        // déconnecter les relations avec la facture
        prisma.purchaseOrder.update({
            where: { id: purchaseOrderExist.id },
            data: {
                productsServices: {
                    disconnect: productsServices.map((ps: any) => ({ id: ps.id })),
                }
            },
        }),

        // mettre à jour les stocks
        ...productServiceUpdates,
    ]);
}

export async function rollbackDeliveryNote(
    deliveryNote: DeliveryNoteType,
) {
    const productsServices = deliveryNote.productsServices || [];
    const billboards = deliveryNote.billboards || [];

    await prisma.$transaction([
        // supprimer les items liés à la facture
        prisma.item.deleteMany({ where: { deliveryNoteId: deliveryNote.id } }),

        // déconnecter les relations avec la facture
        prisma.deliveryNote.update({
            where: { id: deliveryNote.id },
            data: {
                productsServices: {
                    disconnect: productsServices.map((ps: any) => ({ id: ps.id })),
                },
                billboards: {
                    disconnect: billboards.map((b: any) => ({ id: b.id })),
                },
            },
        }),
    ]);
}

export async function rollbackQuote(
    quoteExist: QuoteType,
) {
    const productsServices = quoteExist.productsServices || [];
    const billboards = quoteExist.billboards || [];

    await prisma.$transaction([
        // supprimer les items liés à la facture
        prisma.item.deleteMany({ where: { quoteId: quoteExist.id } }),

        // déconnecter les relations avec la facture
        prisma.quote.update({
            where: { id: quoteExist.id },
            data: {
                productsServices: {
                    disconnect: productsServices.map((ps: any) => ({ id: ps.id })),
                },
                billboards: {
                    disconnect: billboards.map((b: any) => ({ id: b.id })),
                },
            },
        }),
    ]);
}

function hasDateOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    console.log('=== Vérification de chevauchement ===');
    console.log({
        nouvelle_plage: {
            debut: format(start1, 'dd/MM/yyyy HH:mm:ss'),
            fin: format(end1, 'dd/MM/yyyy HH:mm:ss')
        },
        plage_existante: {
            debut: format(start2, 'dd/MM/yyyy HH:mm:ss'),
            fin: format(end2, 'dd/MM/yyyy HH:mm:ss')
        }
    });

    // Vérifier que les dates sont valides
    if (!isValid(start1) || !isValid(end1) || !isValid(start2) || !isValid(end2)) {
        console.log('❌ Une ou plusieurs dates sont invalides');
        return false;
    }

    // Vérifier que chaque plage est cohérente (début <= fin)
    if (isAfter(start1, end1)) {
        console.log('❌ Nouvelle plage incohérente : début > fin');
        return false;
    }

    if (isAfter(start2, end2)) {
        console.log('❌ Plage existante incohérente : début > fin');
        return false;
    }

    // Deux plages se chevauchent si :
    // - Le début de la première est avant ou égal à la fin de la seconde ET
    // - Le début de la seconde est avant ou égal à la fin de la première
    // 
    // En d'autres termes : start1 <= end2 && start2 <= end1
    const condition1 = isBefore(start1, end2) || isEqual(start1, end2); // start1 <= end2
    const condition2 = isBefore(start2, end1) || isEqual(start2, end1); // start2 <= end1

    const hasOverlap = condition1 && condition2;

    console.log({
        'start1 <= end2': condition1,
        'start2 <= end1': condition2,
        'chevauchement': hasOverlap
    });

    if (hasOverlap) {
        console.log('🔴 CONFLIT DÉTECTÉ - Les périodes se chevauchent');
    } else {
        console.log('✅ Aucun conflit - Les périodes ne se chevauchent pas');
    }
    return hasOverlap;
}

function parseDate(date: Date | undefined | null): Date | null {
    if (!date) return null;
    if (date instanceof Date && !isNaN(date.getTime())) return date
    return null;
}

export async function checkBillboardConflicts(
    billboards: BillboardItem[],
    excludeBillboardIds: string[] = []
): Promise<ConflictResult> {

    const validBillboards = billboards.filter(
        (item): item is BillboardItem & { billboardId: string } =>
            item.itemType === "billboard" &&
            item.billboardId !== undefined &&
            item.billboardId !== null &&
            item.locationStart !== undefined &&
            item.locationEnd !== undefined &&
            !excludeBillboardIds.includes(item.billboardId)
    );


    if (validBillboards.length === 0) {
        return { hasConflict: false, conflicts: [] };
    }

    const billboardIds = validBillboards.map(b => b.billboardId);

    const existingItems = await prisma.item.findMany({
        where: {
            billboardId: { in: billboardIds },
            itemType: "billboard",
            state: "APPROVED",
        },
        include: {
            invoice: {
                select: { id: true }
            }
        }
    });


    const conflicts: ConflictResult['conflicts'] = [];

    // Vérifier chaque nouveau billboard
    for (const newBillboard of validBillboards) {

        const newStart = parseDate(new Date(newBillboard.locationStart as Date));
        const newEnd = parseDate(new Date(newBillboard.locationEnd as Date));

        // Ignorer si les dates ne sont pas valides
        if (!newStart || !newEnd) {
            continue;
        }


        // Vérifier que la date de fin est après la date de début
        if (newEnd < newStart) {
            conflicts.push({
                newItem: newBillboard,
                conflictingItem: null as any,
                message: `Date de fin antérieure à la date de début pour le panneau "${newBillboard.name}" (${newBillboard.billboardId})`
            });
            continue;
        }

        // Chercher les conflits avec les items existants
        const conflictingItems = existingItems.filter(existingItem => {
            // Même billboard
            if (existingItem.billboardId !== newBillboard.billboardId) {
                return false;
            }

            const existingStart = existingItem.locationStart;
            const existingEnd = existingItem.locationEnd;

            // Ignorer si les dates existantes ne sont pas valides
            if (!existingStart || !existingEnd) {
                return false;
            }

            // Vérifier le chevauchement des dates
            return hasDateOverlap(newStart, newEnd, existingStart, existingEnd);
        });

        // Ajouter les conflits trouvés
        conflictingItems.forEach(conflictingItem => {
            conflicts.push({
                newItem: newBillboard,
                conflictingItem: conflictingItem as ExistingBillboardItem,
                message: `Conflit détecté pour le panneau "${newBillboard.name}" (${newBillboard.billboardId}): nouvelle période (${newStart.toLocaleDateString()} - ${newEnd.toLocaleDateString()}) chevauche avec une période existante (${conflictingItem.locationStart!.toLocaleDateString()} - ${conflictingItem.locationEnd!.toLocaleDateString()})`
            });
        });
    }

    return {
        hasConflict: conflicts.length > 0,
        conflicts
    };
}

export async function checkAccessDeletion(type: $Enums.DeletionType, ids: string[], companyId: string) {
    const session = await getSession();
    if (session?.user.role !== "ADMIN") {
        for (const id of ids) {
            const exist = await prisma.deletion.findFirst({
                where: { recordId: id }
            })

            if (exist) continue
            await prisma.deletion.create({
                data: {
                    type,
                    recordId: id,
                    company: {
                        connect: { id: companyId }
                    }
                }
            });
            switch (type) {
                case "QUOTES":
                    await prisma.quote.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "INVOICES":
                    await prisma.invoice.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "DELIVERY_NOTES":
                    await prisma.deliveryNote.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "PURCHASE_ORDERS":
                    await prisma.purchaseOrder.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "RECEIPTS":
                    await prisma.receipt.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "DISBURSEMENTS":
                    await prisma.dibursement.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "PRODUCT_SERVICES":
                    await prisma.productService.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "BILLBOARDS":
                    await prisma.billboard.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "CLIENTS":
                    await prisma.client.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "SUPPLIERS":
                    await prisma.supplier.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "PROJECTS":
                    await prisma.project.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
                case "APPOINTMENTS":
                    await prisma.appointment.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;

                case "CONTRACT":
                    await prisma.contract.update({
                        where: { id },
                        data: {
                            hasDelete: true
                        }
                    })
                    break;
            }
        }
        return true
    }

    return false
}


export async function filters({
    companyId,
    start,
    end,
    period,
    reportType
}: {
    companyId: string;
    start?: string;
    end?: string;
    period?: PeriodType;
    reportType: ReportType
}) {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (start || end) {
        if (start) {
            const parsed = new Date(start);
            if (isNaN(parsed.getTime())) {
                throw new Error("start invalide. Utilisez un format de date ISO.");
            }
            startDate = parsed;
        }

        if (end) {
            const parsed = new Date(end);
            if (isNaN(parsed.getTime())) {
                throw new Error("end invalide. Utilisez un format de date ISO.");
            }
            endDate = parsed;
        }
    } else if (period) {
        switch (period) {
            case "currentFiscalYear":
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            case "currentQuarter":
                startDate = startOfQuarter(now);
                endDate = endOfQuarter(now);
                break;
            case "currentMonth":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "previousMonth":
                startDate = startOfMonth(subMonths(now, 1));
                endDate = endOfMonth(subMonths(now, 1));
                break;
            case "previousYear":
                startDate = startOfYear(subYears(now, 1));
                endDate = endOfYear(subYears(now, 1));
                break;
        }
    }

    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
        throw new Error("start doit être antérieur ou égal à end.");
    }

    switch (reportType) {
        case "salesByClient": {
            const invoiceWhere: any = { companyId };

            if (startDate || endDate) {
                invoiceWhere.createdAt = {};
                if (startDate && !endDate) {
                    invoiceWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    invoiceWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    invoiceWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const clients = await prisma.client.findMany({
                where: { companyId },
                include: {
                    invoices: {
                        where: invoiceWhere,
                        select: {
                            totalHT: true,
                            totalTTC: true,
                            amountType: true,
                            payee: true,
                            isPaid: true,
                            id: true,
                            createdAt: true,
                        },
                    },
                },
            });

            const result = clients
                .map((c) => {
                    const totalGeneratedDecimal = c.invoices.reduce((acc: Decimal, inv: any) => {
                        const useHT = inv.amountType === "HT";
                        const amount = useHT ? inv.totalHT : inv.totalTTC;
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = amount !== null && amount !== undefined ? amount.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalPaidDecimal = c.invoices.reduce((acc: Decimal, inv: any) => {
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = inv.payee !== null && inv.payee !== undefined ? inv.payee.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalRemainingDecimal = totalGeneratedDecimal.minus(totalPaidDecimal);

                    const clientName = c.companyName
                        ? c.companyName
                        : [c.firstname, c.lastname].filter(Boolean).join(" ").trim();

                    return {
                        id: c.id,
                        date: c.createdAt,
                        reference: "",
                        name: clientName || "-",
                        count: c.invoices.length,
                        totalGenerated: formatDecimal(totalGeneratedDecimal),
                        totalPaid: formatDecimal(totalPaidDecimal),
                        totalRemaining: formatDecimal(totalRemainingDecimal),
                    };
                })
                .filter(item => item.count > 0);

            return result;
        }

        case "salesByItem": {
            const invoiceWhere: any = { companyId };

            if (startDate || endDate) {
                invoiceWhere.createdAt = {};
                if (startDate && !endDate) {
                    invoiceWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    invoiceWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    invoiceWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const products = await prisma.productService.findMany({
                where: { companyId },
                include: {
                    invoices: {
                        where: invoiceWhere,
                        select: {
                            totalHT: true,
                            totalTTC: true,
                            amountType: true,
                            payee: true,
                            id: true,
                            createdAt: true,
                        },
                    },
                },
            });

            const result = products
                .map((p) => {
                    const totalGeneratedDecimal = p.invoices.reduce((acc: Decimal, inv: any) => {
                        const useHT = inv.amountType === "HT";
                        const amount = useHT ? inv.totalHT : inv.totalTTC;
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = amount !== null && amount !== undefined ? amount.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalPaidDecimal = p.invoices.reduce((acc: Decimal, inv: any) => {
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = inv.payee !== null && inv.payee !== undefined ? inv.payee.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalRemainingDecimal = totalGeneratedDecimal.minus(totalPaidDecimal);

                    return {
                        id: p.id,
                        date: p.createdAt,
                        reference: p.reference || "",
                        name: p.designation || "-",
                        type: p.type || "-",
                        count: p.invoices.length,
                        totalGenerated: formatDecimal(totalGeneratedDecimal),
                        totalPaid: formatDecimal(totalPaidDecimal),
                        totalRemaining: formatDecimal(totalRemainingDecimal),
                    };
                })
                .filter(item => item.count > 0); // Retirer les éléments vides

            return result;
        }

        case "salesByBillboards": {
            const invoiceWhere: any = { companyId };

            if (startDate || endDate) {
                invoiceWhere.createdAt = {};
                if (startDate && !endDate) {
                    invoiceWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    invoiceWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    invoiceWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const billboards = await prisma.billboard.findMany({
                where: { companyId },
                include: {
                    type: true,
                    invoices: {
                        where: invoiceWhere,
                        select: {
                            totalHT: true,
                            totalTTC: true,
                            amountType: true,
                            payee: true,
                            id: true,
                            createdAt: true,
                        },
                    },
                },
            });

            const result = billboards
                .map((b) => {
                    const totalGeneratedDecimal = b.invoices.reduce((acc: Decimal, inv: any) => {
                        const useHT = inv.amountType === "HT";
                        const amount = useHT ? inv.totalHT : inv.totalTTC;
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = amount !== null && amount !== undefined ? amount.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalPaidDecimal = b.invoices.reduce((acc: Decimal, inv: any) => {
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = inv.payee !== null && inv.payee !== undefined ? inv.payee.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const totalRemainingDecimal = totalGeneratedDecimal.minus(totalPaidDecimal);

                    return {
                        id: b.id,
                        date: b.createdAt,
                        reference: b.reference || "",
                        name: b.name || "-",
                        type: b.type?.name || "-",
                        count: b.invoices.length,
                        totalGenerated: formatDecimal(totalGeneratedDecimal),
                        totalPaid: formatDecimal(totalPaidDecimal),
                        totalRemaining: formatDecimal(totalRemainingDecimal),
                    };
                })
                .filter(item => item.count > 0); // Retirer les éléments vides

            return result;
        }

        case "paymentsByDate": {
            const receiptWhere: any = { companyId };

            if (startDate || endDate) {
                receiptWhere.createdAt = {};
                if (startDate && !endDate) {
                    receiptWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    receiptWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    receiptWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const receipts = await prisma.receipt.findMany({
                where: receiptWhere,
                include: {
                    client: true,
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            const result = receipts.map((r) => {
                let amountDecimal = new Decimal(0);
                try {
                    const raw = r.amount !== null && r.amount !== undefined ? r.amount?.toString() : "0";
                    amountDecimal = new Decimal(raw);
                } catch (err) {
                    amountDecimal = new Decimal(0);
                }

                const clientName = r.client?.companyName
                    ? r.client.companyName
                    : r.client
                        ? [r.client.firstname, r.client.lastname].filter(Boolean).join(" ").trim()
                        : "-";

                return {
                    id: r.id,
                    date: r.date,
                    client: clientName || "-",
                    amount: formatDecimal(amountDecimal),
                };
            });

            return result;
        }

        case "paymentsByType": {
            const receiptWhere: any = { companyId };

            if (startDate || endDate) {
                receiptWhere.createdAt = {};
                if (startDate && !endDate) {
                    receiptWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    receiptWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    receiptWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const receipts = await prisma.receipt.findMany({
                where: receiptWhere,
                include: {
                    source: true,
                },
            });

            const sourceMap = new Map<string, { id: string; date: Date; source: string; amount: Decimal }>();

            receipts.forEach((r) => {
                const sourceName = r.source?.name || "-";
                let amountDecimal = new Decimal(0);
                try {
                    const raw = r.amount !== null && r.amount !== undefined ? r.amount.toString() : "0";
                    amountDecimal = new Decimal(raw);
                } catch (err) {
                    amountDecimal = new Decimal(0);
                }

                if (sourceMap.has(sourceName)) {
                    const existing = sourceMap.get(sourceName)!;
                    existing.amount = existing.amount.plus(amountDecimal);
                    if (r.date > existing.date) {
                        existing.date = r.date;
                    }
                } else {
                    sourceMap.set(sourceName, {
                        id: r.source?.id || r.id,
                        date: r.date,
                        source: sourceName,
                        amount: amountDecimal,
                    });
                }
            });

            const result = Array.from(sourceMap.values())
                .map(item => ({
                    id: item.id,
                    date: item.date,
                    source: item.source,
                    amount: formatDecimal(item.amount),
                }))
                .sort((a, b) => a.date.getTime() - b.date.getTime());

            return result;
        }

        case "paymentsByClients": {
            const receiptWhere: any = { companyId };

            if (startDate || endDate) {
                receiptWhere.createdAt = {};
                if (startDate && !endDate) {
                    receiptWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    receiptWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    receiptWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const clients = await prisma.client.findMany({
                where: { companyId },
                include: {
                    receipts: {
                        where: receiptWhere,
                    },
                },
            });

            const result = clients
                .map((c) => {
                    const totalPaidDecimal = c.receipts.reduce((acc: Decimal, receipt: any) => {
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = receipt.amount !== null && receipt.amount !== undefined ? receipt.amount.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    const clientName = c.companyName
                        ? c.companyName
                        : [c.firstname, c.lastname].filter(Boolean).join(" ").trim();

                    return {
                        id: c.id,
                        client: clientName || "-",
                        count: c.receipts.length,
                        totalPaid: formatDecimal(totalPaidDecimal),
                    };
                })
                .filter(item => item.count > 0);

            return result;
        }

        case "expensesByCategories": {
            const disbursementWhere: any = { companyId };

            if (startDate || endDate) {
                disbursementWhere.createdAt = {};
                if (startDate && !endDate) {
                    disbursementWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    disbursementWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    disbursementWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const categories = await prisma.transactionCategory.findMany({
                where: { companyId, type: "DISBURSEMENT" },
                include: {
                    dibursements: {
                        where: disbursementWhere,
                    },
                },
            });

            const result = categories
                .map((cat) => {
                    const totalAmountDecimal = cat.dibursements.reduce((acc: Decimal, disb: any) => {
                        let valueDecimal = new Decimal(0);
                        try {
                            const raw = disb.amount !== null && disb.amount !== undefined ? disb.amount.toString() : "0";
                            valueDecimal = new Decimal(raw);
                        } catch (err) {
                            valueDecimal = new Decimal(0);
                        }
                        return acc.plus(valueDecimal);
                    }, new Decimal(0));

                    return {
                        id: cat.id,
                        date: cat.createdAt,
                        category: cat.name || "-",
                        count: cat.dibursements.length,
                        totalAmount: formatDecimal(totalAmountDecimal),
                    };
                })
                .filter(item => item.count > 0);

            return result;
        }

        case "expensesJournal": {
            const disbursementWhere: any = { companyId };

            if (startDate || endDate) {
                disbursementWhere.createdAt = {};
                if (startDate && !endDate) {
                    disbursementWhere.createdAt.gte = startDate;
                } else if (!startDate && endDate) {
                    disbursementWhere.createdAt.lte = endDate;
                } else if (startDate && endDate) {
                    disbursementWhere.createdAt = { gte: startDate, lte: endDate };
                }
            }

            const disbursements = await prisma.dibursement.findMany({
                where: disbursementWhere,
                include: {
                    category: true,
                    nature: true,
                    source: true,
                    client: true,
                    suppliers: true,
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            const result = disbursements.map((d) => {
                let amountDecimal = new Decimal(0);
                try {
                    const raw = d.amount !== null && d.amount !== undefined ? d.amount.toString() : "0";
                    amountDecimal = new Decimal(raw);
                } catch (err) {
                    amountDecimal = new Decimal(0);
                }

                let beneficiary = "-";
                if (d.client) {
                    beneficiary = d.client.companyName
                        ? d.client.companyName
                        : [d.client.firstname, d.client.lastname].filter(Boolean).join(" ").trim() || "-";
                } else if (d.suppliers.length > 0) {
                    const supplier = d.suppliers[0];
                    beneficiary = supplier.companyName
                        ? supplier.companyName
                        : [supplier.firstname, supplier.lastname].filter(Boolean).join(" ").trim() || "-";
                }

                return {
                    id: d.id,
                    date: d.date,
                    reference: d.reference || 0,
                    category: d.category?.name || "-",
                    nature: d.nature?.name || "-",
                    source: d.source?.name || "-",
                    beneficiary,
                    description: d.description || "-",
                    paymentType: d.paymentType || "-",
                    amount: formatDecimal(amountDecimal),
                };
            });

            return result;
        }

        case "debtorAccountAging": {
            const clients = await prisma.client.findMany({
                where: {
                    companyId,
                    due: { gt: 0 }
                },
                include: {
                    invoices: {
                        where: {
                            isPaid: false,
                        },
                        select: {
                            id: true,
                            paymentLimit: true,
                            totalHT: true,
                            totalTTC: true,
                            amountType: true,
                            payee: true,
                            createdAt: true,
                        },
                    },
                },
            });

            const result = clients
                .map((c) => {
                    let totalDue = new Decimal(0);
                    let payableToday = new Decimal(0);
                    let delay1to30 = new Decimal(0);
                    let delay31to60 = new Decimal(0);
                    let delay61to90 = new Decimal(0);
                    let delayOver91 = new Decimal(0);

                    c.invoices.forEach((inv) => {
                        const useHT = inv.amountType === "HT";
                        const total = useHT ? inv.totalHT : inv.totalTTC;

                        let totalDecimal = new Decimal(0);
                        let payeeDecimal = new Decimal(0);

                        try {
                            totalDecimal = new Decimal(total?.toString() || "0");
                            payeeDecimal = new Decimal(inv.payee?.toString() || "0");
                        } catch (err) {
                            totalDecimal = new Decimal(0);
                            payeeDecimal = new Decimal(0);
                        }

                        const remaining = totalDecimal.minus(payeeDecimal);
                        totalDue = totalDue.plus(remaining);

                        const dueDate = new Date(inv.createdAt);
                        const daysLimit = parseInt(inv.paymentLimit) || 0;
                        dueDate.setDate(dueDate.getDate() + daysLimit);

                        const daysLate = differenceInDays(now, dueDate);

                        if (daysLate <= 0) {
                            payableToday = payableToday.plus(remaining);
                        } else if (daysLate >= 1 && daysLate <= 30) {
                            delay1to30 = delay1to30.plus(remaining);
                        } else if (daysLate >= 31 && daysLate <= 60) {
                            delay31to60 = delay31to60.plus(remaining);
                        } else if (daysLate >= 61 && daysLate <= 90) {
                            delay61to90 = delay61to90.plus(remaining);
                        } else if (daysLate >= 91) {
                            delayOver91 = delayOver91.plus(remaining);
                        }
                    });

                    const clientName = c.companyName
                        ? c.companyName
                        : [c.firstname, c.lastname].filter(Boolean).join(" ").trim();

                    return {
                        id: c.id,
                        client: clientName || "-",
                        totalDue: formatDecimal(totalDue),
                        payableToday: formatDecimal(payableToday),
                        delay1to30: formatDecimal(delay1to30),
                        delay31to60: formatDecimal(delay31to60),
                        delay61to90: formatDecimal(delay61to90),
                        delayOver91: formatDecimal(delayOver91),
                    };
                })
                .filter(item => parseFloat(item.totalDue) > 0); // Retirer les éléments vides

            return result;
        }

        default:
            throw new Error("Type de rapport non supporté.");
    }
}