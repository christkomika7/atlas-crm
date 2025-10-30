'use server';
import path from "path";
import fs from "fs-extra";
import { existsSync } from "fs";
import mime from "mime-types";
import prisma from "./prisma";
import { removePath, saveFile } from "./file";
import { BillboardItem, ConflictResult, ExistingBillboardItem, InvoiceType } from "@/types/invoice.types";
import { endOfMonth, endOfQuarter, endOfYear, format, isAfter, isBefore, isEqual, isValid, startOfMonth, startOfQuarter, startOfYear, subMonths, subYears } from "date-fns";
import { QuoteType } from "@/types/quote.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { getSession } from "./auth";
import { $Enums } from "./generated/prisma";
import { NextResponse } from "next/server";
import { PeriodType, ReportType } from "@/types/company.types";
import { Decimal } from "decimal.js";


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


export async function handleFileOperations(result: any, data: any, companyHasChangeName: boolean) {
    const uploadedPaths: string[] = [];

    try {
        // Traiter les fichiers des nouveaux utilisateurs
        for (const user of result.usersToAdd) {
            const folder = path.join(
                data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                "user",
                `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
            );

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion des fichiers
            if (user.image && folder) {
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }
            if (user.passport && folder) {
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }
            if (user.document && folder) {
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les chemins des fichiers
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || null,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || null,
                            internalRegulations: documentPath || null,
                        },
                    },
                },
            });
        }

        // Traiter les fichiers des utilisateurs mis à jour
        for (const user of result.usersToUpdate) {
            const olderUserVersion = await prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true }
            });

            if (!olderUserVersion) continue;

            const usernameHasChange = (
                olderUserVersion.name.toLowerCase() !==
                `${user.firstname} ${user.lastname}`.toLowerCase()
            );

            let folder = (usernameHasChange || companyHasChangeName)
                ? path.join(
                    data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                    "user",
                    `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
                )
                : olderUserVersion.path || "";

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion du déplacement des dossiers
            if (usernameHasChange || companyHasChangeName) {
                if (olderUserVersion.path && existsSync(olderUserVersion.path)) {
                    await fs.mkdir(folder, { recursive: true });
                    const files = await fs.readdir(olderUserVersion.path);
                    for (const file of files) {
                        await fs.rename(
                            path.join(olderUserVersion.path, file),
                            path.join(folder, file)
                        );
                    }
                    await fs.rmdir(olderUserVersion.path);
                }
            }

            // Gestion des fichiers
            if (user.image && folder) {
                if (olderUserVersion.image) {
                    await removePath(olderUserVersion.image);
                }
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }

            if (user.passport && folder) {
                if (olderUserVersion.profile?.passport) {
                    await removePath(olderUserVersion.profile.passport);
                }
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }

            if (user.document && folder) {
                if (olderUserVersion.profile?.internalRegulations) {
                    await removePath(olderUserVersion.profile.internalRegulations);
                }
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les nouveaux chemins
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || olderUserVersion.image,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || olderUserVersion.profile?.passport,
                            internalRegulations: documentPath || olderUserVersion.profile?.internalRegulations,
                        },
                    },
                },
            });
        }

        // Nettoyer les fichiers des utilisateurs supprimés
        // (cette partie peut être faite de manière asynchrone)

    } catch (error) {
        // Nettoyage en cas d'erreur
        for (const path of uploadedPaths) {
            await removePath(path).catch(console.error);
        }
        throw error;
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

    // Récupérer les IDs des billboards
    const billboardIds = validBillboards.map(b => b.billboardId);

    // Récupérer les items existants pour ces billboards
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


    console.log({ existingItems });


    const conflicts: ConflictResult['conflicts'] = [];

    // Vérifier chaque nouveau billboard
    for (const newBillboard of validBillboards) {
        const newStart = parseDate(newBillboard.locationStart);
        const newEnd = parseDate(newBillboard.locationEnd);

        // Ignorer si les dates ne sont pas valides
        if (!newStart || !newEnd) {
            continue;
        }

        console.log({ newStart, newEnd });

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
                return NextResponse.json(
                    { state: "error", message: "start invalide. Utilisez un format de date ISO." },
                    { status: 400 }
                );
            }
            startDate = parsed;
        }

        if (end) {
            const parsed = new Date(end);
            if (isNaN(parsed.getTime())) {
                return NextResponse.json(
                    { state: "error", message: "end invalide. Utilisez un format de date ISO." },
                    { status: 400 }
                );
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

    const whereClause: any = { companyId };

    if (startDate || endDate) {
        whereClause.createdAt = {};

        if (startDate && !endDate) {
            whereClause.createdAt.gte = startDate;
        } else if (!startDate && endDate) {
            whereClause.createdAt.lte = endDate;
        } else if (startDate && endDate) {
            if (startDate.getTime() > endDate.getTime()) {
                return NextResponse.json(
                    { state: "error", message: "start doit être antérieur ou égal à end." },
                    { status: 400 }
                );
            }
            whereClause.createdAt = { gte: startDate, lte: endDate };
        }
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
                            totalTTC: true,
                            payee: true,
                            isPaid: true,
                            id: true,
                        },
                    },
                },
            });

            const result = clients.map((c) => {
                const totalGeneratedDecimal = c.invoices.reduce((acc: Decimal, inv: any) => {
                    let valueDecimal = new Decimal(0);
                    try {
                        // Force une conversion en string pour éviter les erreurs de construction
                        const raw = inv.totalTTC !== null && inv.totalTTC !== undefined ? inv.totalTTC.toString() : "0";
                        valueDecimal = new Decimal(raw);
                    } catch (err) {
                        // En cas d'erreur, retomber sur 0 (et éventuellement logguer)
                        // console.error("parse totalTTC failed for invoice", inv.id, err);
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
                        // console.error("parse payee failed for invoice", inv.id, err);
                        valueDecimal = new Decimal(0);
                    }
                    return acc.plus(valueDecimal);
                }, new Decimal(0));

                const totalRemainingDecimal = totalGeneratedDecimal.minus(totalPaidDecimal);

                return {
                    id: c.id,
                    date: c.createdAt,
                    reference: "",
                    name: c.companyName || `${c.firstname} ${c.lastname}`.trim(),
                    count: c.invoices.length,
                    totalGenerated: totalGeneratedDecimal.toFixed(2),
                    totalPaid: totalPaidDecimal.toFixed(2),
                    totalRemaining: totalRemainingDecimal.toFixed(2),
                };
            });

            return result;
        }


        case "salesByItem": {
            // Filtre des invoices (mêmes règles que précédemment)
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

            // Récupérer les produits/services et leurs factures correspondant aux filtres
            const products = await prisma.productService.findMany({
                where: { companyId },
                include: {
                    invoices: {
                        where: invoiceWhere,
                        select: {
                            totalTTC: true,
                            payee: true,
                            id: true,
                        },
                    },
                },
            });

            const result = products.map((p) => {
                const totalGeneratedDecimal = p.invoices.reduce((acc: Decimal, inv: any) => {
                    let valueDecimal = new Decimal(0);
                    try {
                        const raw = inv.totalTTC !== null && inv.totalTTC !== undefined ? inv.totalTTC.toString() : "0";
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
                    reference: p.reference,
                    name: p.designation,
                    count: p.invoices.length,
                    totalGenerated: totalGeneratedDecimal.toFixed(2),
                    totalPaid: totalPaidDecimal.toFixed(2),
                    totalRemaining: totalRemainingDecimal.toFixed(2),
                };
            });

            return result;
        }

        case "salesByBillboards": {
            // Filtre des invoices (mêmes règles que précédemment)
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

            // Récupérer les panneaux (billboards) et leurs factures correspondant aux filtres
            const billboards = await prisma.billboard.findMany({
                where: { companyId },
                include: {
                    invoices: {
                        where: invoiceWhere,
                        select: {
                            totalTTC: true,
                            payee: true,
                            id: true,
                        },
                    },
                },
            });

            const result = billboards.map((b) => {
                const totalGeneratedDecimal = b.invoices.reduce((acc: Decimal, inv: any) => {
                    let valueDecimal = new Decimal(0);
                    try {
                        const raw = inv.totalTTC !== null && inv.totalTTC !== undefined ? inv.totalTTC.toString() : "0";
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
                    reference: b.reference,
                    name: b.name,
                    count: b.invoices.length,
                    totalGenerated: totalGeneratedDecimal.toFixed(2),
                    totalPaid: totalPaidDecimal.toFixed(2),
                    totalRemaining: totalRemainingDecimal.toFixed(2),
                };
            });

            return result;
        }
        case "paymentsByDate":
        case "paymentsByClients":
        case "paymentsByType":
        case "expensesByCategories":
        case "expensesJournal":
        case "debtorAccountAging":
    }

}
