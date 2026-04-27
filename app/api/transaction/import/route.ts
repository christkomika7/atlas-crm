import { NextRequest, NextResponse } from "next/server";
import { checkAccess, sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { TransactionImportType } from "@/types/transaction.type";
import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX } from "@/config/constant";
import Decimal from "decimal.js";
import { formatNumber } from "@/lib/utils";
import { acceptPayment } from "@/lib/data";
import { $Enums } from "@/lib/generated/prisma";
import { format, parse } from "date-fns";

export async function POST(req: NextRequest) {
    const result = await checkAccess(["TRANSACTION"], "CREATE");
    const { isAdmin, userId } = await sessionAccess();

    if (!result.authorized) {
        return Response.json({ state: "error", message: result.message }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId as string } });
    if (!user) return NextResponse.json({ state: "error", message: "Utilisateur non trouvé." }, { status: 400 });

    try {
        const { data, companyId } = await req.json();

        if (!data || !companyId) {
            return NextResponse.json({ state: "error", message: "Données ou entreprise manquante." }, { status: 400 });
        }

        const transactions = data as TransactionImportType[];

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { documentModel: true }
        });

        if (!company) {
            return NextResponse.json({ state: "error", message: "Entreprise introuvable." }, { status: 404 });
        }

        const [existingCategories, existingNatures, existingSources, existingUserActions] = await Promise.all([
            prisma.transactionCategory.findMany({ where: { companyId }, include: { company: true } }),
            prisma.transactionNature.findMany({ where: { companyId } }),
            prisma.source.findMany({ where: { companyId } }),
            prisma.userAction.findMany({ where: { companyId } }),
        ]);

        const categoryMap = new Map(existingCategories.map(c => [c.name, c]));
        const natureMap = new Map(existingNatures.map(n => [`${n.name}-${n.categoryId}`, n]));
        const sourceMap = new Map(existingSources.map(s => [s.name, s]));
        const userActionMap = new Map(existingUserActions.map(u => [u.name, u]));

        let earlyReturnResponse: { status: string; message: string } | null = null;

        await prisma.$transaction(async (tx) => {
            for (const transaction of transactions) {

                if (transaction.Catégorie === "Transfert CaC") continue;

                if (!transaction.Catégorie || transaction.Catégorie === "-") throw new Error("Catégorie manquante.");
                if (!transaction.Nature || transaction.Nature === "-") throw new Error("Nature manquante.");
                if (!transaction.Source || transaction.Source === "-") throw new Error("Source manquante.");
                if (!transaction.Mouvement || transaction.Mouvement === "-") throw new Error("Mouvement manquant.");

                let invoiceId: string | null = null;
                let purchaseOrderId: string | null = null;
                let projectId: string | null = null;
                let paymentId: string | null = null;
                let clientId: string | null = null;

                const parsed = parse(transaction.Date, "dd/MM/yyyy", new Date());
                const finalDate = new Date(Date.UTC(
                    parsed.getFullYear(),
                    parsed.getMonth(),
                    parsed.getDate()
                ));

                const date = finalDate;
                const amountType = transaction["HT Montant"] && transaction["HT Montant"] !== "-" ? "HT" : "TTC";
                const rawAmount = amountType === "HT" ? transaction["HT Montant"] : transaction["TTC Montant"];
                const amount = new Decimal((rawAmount?.replace("XAF", "").trim() || "0").replaceAll(" ", ""));
                const paymentBruteType = acceptPayment.find((payment) => payment.label === transaction["Mode de paiement"])?.value || "cash";
                const paymentType = paymentBruteType === "cash" ? $Enums.SourceType.CASH : $Enums.SourceType.BANK;
                const period = transaction.Période;
                const checkNumber = String(transaction["Numéro de chèque"]);
                const comment = transaction.Commentaire;

                let category = categoryMap.get(transaction.Catégorie) ?? null;
                if (!category) {
                    category = await tx.transactionCategory.create({
                        data: {
                            name: transaction.Catégorie,
                            type: transaction.Mouvement === "Entrée" ? "RECEIPT" : "DISBURSEMENT",
                            companyId
                        },
                        include: { company: true }
                    });
                    categoryMap.set(category.name, category);
                }

                let nature = natureMap.get(`${transaction.Nature}-${category.id}`) ?? null;
                if (!nature) {
                    nature = await tx.transactionNature.create({
                        data: { name: transaction.Nature, categoryId: category.id, companyId }
                    });
                    natureMap.set(`${nature.name}-${nature.categoryId}`, nature);
                }

                let sourceId: string | null = null;
                let source = sourceMap.get(transaction.Source) ?? null;
                if (!source) {
                    source = await tx.source.create({
                        data: { name: transaction.Source, companyId, sourceType: paymentType as $Enums.SourceType }
                    });
                    sourceMap.set(source.name, source);
                }
                sourceId = source.id;

                let clientOrSupplierId: string | null = null;
                const tierValue = transaction["Client | Fournisseur | Tiers"];
                if (tierValue && tierValue !== "-") {
                    let userAction = userActionMap.get(tierValue) ?? null;
                    if (!userAction) {
                        userAction = await tx.userAction.create({
                            data: { name: tierValue, companyId, natureId: nature.id }
                        });
                        userActionMap.set(userAction.name, userAction);
                    }
                    clientOrSupplierId = userAction.id;
                }

                if (transaction["Référence du document"] && transaction["Référence du document"] !== "-") {
                    const recordType = transaction.Mouvement === "Entrée" ? "invoice" : "purchaseOrder";
                    const referenceDocument = transaction["Référence du document"];

                    if (recordType === "invoice") {
                        const reference = company.documentModel?.invoicesPrefix || INVOICE_PREFIX;
                        const invoiceRef = Number(referenceDocument.split(reference)[1]);
                        const invoice = await tx.invoice.findFirst({
                            where: { companyId, invoiceNumber: invoiceRef },
                            include: { project: true, company: true }
                        });

                        if (invoice) {
                            invoiceId = invoice.id;
                            projectId = invoice.project?.id || null;
                            clientId = invoice.clientId || null;

                            const total = invoice.amountType === "HT" ? invoice.totalHT : invoice.totalTTC;
                            const payee = invoice.payee;
                            const remaining = total.minus(payee);
                            const newAmount = new Decimal(amount);

                            if (newAmount.gt(remaining.valueOf())) {
                                throw new Error(`Le montant saisi dépasse le solde restant à payer (${formatNumber(remaining.toString())} ${invoice.company.currency}).`);
                            }

                            const hasCompletedPayment = payee.add(newAmount.valueOf()).gte(total.minus(0.01));

                            const newPayment = await tx.payment.create({
                                data: {
                                    createdAt: date,
                                    amount: String(amount),
                                    paymentMode: paymentType,
                                    infos: comment,
                                    invoice: { connect: { id: invoiceId } },
                                },
                            });
                            paymentId = newPayment.id;

                            const updatedInvoice = await tx.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    isPaid: hasCompletedPayment,
                                    payee: payee.add(newAmount.valueOf()),
                                },
                                include: { company: { include: { documentModel: true } }, client: true },
                            });

                            if (updatedInvoice.clientId) {
                                await tx.client.update({
                                    where: { id: updatedInvoice.clientId },
                                    data: { due: { decrement: amount }, paidAmount: { increment: amount } }
                                });
                            }

                            if (updatedInvoice.projectId) {
                                await tx.project.update({
                                    where: { id: updatedInvoice.projectId },
                                    data: { balance: { increment: amount } }
                                });
                            }
                        }
                    }

                    if (recordType === "purchaseOrder") {
                        const reference = company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX;
                        const purchaseOrderRef = Number(referenceDocument.split(reference)[1]);
                        const purchaseOrder = await tx.purchaseOrder.findFirst({
                            where: { companyId, purchaseOrderNumber: purchaseOrderRef },
                            include: { project: true, company: true }
                        });

                        if (purchaseOrder) {
                            purchaseOrderId = purchaseOrder.id;
                            projectId = purchaseOrder.project?.id || null;

                            if (purchaseOrder.isPaid) {
                                throw new Error("Ce bon de commande a déjà été réglé et ne peut pas recevoir de nouveau paiement.");
                            }

                            const total = purchaseOrder.amountType === "HT" ? purchaseOrder.totalHT : purchaseOrder.totalTTC;
                            const payee = purchaseOrder.payee;
                            const remaining = total.minus(payee);
                            const newAmount = new Decimal(amount);

                            if (newAmount.gt(remaining.valueOf())) {
                                throw new Error(`Le montant saisi dépasse le solde restant à payer (${formatNumber(remaining.toString())} ${purchaseOrder.company.currency}).`);
                            }

                            const hasCompletedPayment = payee.add(newAmount.valueOf()).gte(total.minus(0.01));

                            if (!isAdmin) {
                                const newDibursement = await tx.dibursementData.create({
                                    data: {
                                        date,
                                        amount,
                                        amountType,
                                        category: category.id,
                                        nature: nature.id,
                                        source: sourceId,
                                        paymentType,
                                        checkNumber,
                                        period,
                                        purchaseOrder: purchaseOrder.id,
                                        project: projectId,
                                        infos: comment || "",
                                        ...(clientOrSupplierId && {
                                            userAction: { connect: { id: clientOrSupplierId } }
                                        })
                                    }
                                });

                                await tx.notification.create({
                                    data: {
                                        type: 'CONFIRM',
                                        for: 'DISBURSEMENT',
                                        message: `${user.name} a initié un décaissement de ${formatNumber(amount)} ${purchaseOrder.company.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} », actuellement en attente de validation.\n\nCommentaire :\n${comment}`,
                                        dibursement: { connect: { id: newDibursement.id } },
                                        company: { connect: { id: companyId } }
                                    }
                                });

                                earlyReturnResponse = { status: "success", message: "Votre requête est en attente de validation." };
                                return;
                            }

                            const newPayment = await tx.payment.create({
                                data: {
                                    createdAt: date,
                                    amount: String(amount),
                                    paymentMode: paymentType,
                                    infos: comment,
                                    purchaseOrder: { connect: { id: purchaseOrderId } },
                                },
                            });
                            paymentId = newPayment.id;

                            const updatedPurchaseOrder = await tx.purchaseOrder.update({
                                where: { id: purchaseOrderId },
                                data: {
                                    isPaid: hasCompletedPayment,
                                    payee: payee.add(newAmount.valueOf()),
                                },
                                include: { supplier: true }
                            });

                            if (updatedPurchaseOrder.supplierId) {
                                await tx.supplier.update({
                                    where: { id: updatedPurchaseOrder.supplierId },
                                    data: { due: { decrement: amount }, paidAmount: { increment: amount } }
                                });
                            }
                        }
                    }
                }

                if (transaction.Mouvement === "Entrée") {
                    const referenceDocument: any = {};
                    if (paymentId) Object.assign(referenceDocument, { payment: { connect: { id: paymentId } } });
                    if (clientId) Object.assign(referenceDocument, { client: { connect: { id: clientId } } });

                    const createdReceipt = await tx.receipt.create({
                        data: {
                            date,
                            amount,
                            amountType,
                            categoryId: category.id,
                            natureId: nature.id,
                            sourceId,
                            userActionId: clientOrSupplierId,
                            paymentType,
                            checkNumber,
                            infos: comment || "",
                            companyId,
                            ...(invoiceId && { referenceInvoiceId: invoiceId, projectId }),
                            ...referenceDocument
                        },
                        include: { company: true, source: true }
                    });

                    await tx.notification.create({
                        data: {
                            type: 'ALERT',
                            for: 'RECEIPT',
                            message: `${user.name} a réalisé un encaissement de ${formatNumber(amount)} ${createdReceipt.company.currency} dans le compte ${createdReceipt.source?.name}.\n\nCommentaire :\n${comment}`,
                            receipt: { connect: { id: createdReceipt.id } },
                            company: { connect: { id: createdReceipt.companyId } }
                        }
                    });
                }

                if (transaction.Mouvement === "Sortie") {
                    if (!isAdmin) {
                        const newDibursement = await tx.dibursementData.create({
                            data: {
                                date,
                                amount,
                                amountType,
                                category: category.id,
                                nature: nature.id,
                                source: sourceId,
                                paymentType,
                                checkNumber,
                                period,
                                purchaseOrder: purchaseOrderId,
                                project: projectId,
                                infos: comment || "",
                                ...(clientOrSupplierId && {
                                    userAction: { connect: { id: clientOrSupplierId } }
                                })
                            }
                        });

                        await tx.notification.create({
                            data: {
                                type: 'CONFIRM',
                                for: 'DISBURSEMENT',
                                message: `${user.name} a initié un décaissement de ${formatNumber(amount)} ${category.company.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} », actuellement en attente de validation.\n\nCommentaire :\n${comment}`,
                                dibursement: { connect: { id: newDibursement.id } },
                                company: { connect: { id: category.companyId } }
                            }
                        });

                        earlyReturnResponse = { status: "success", message: "Votre requête est en attente de validation." };
                        return;
                    }

                    const referenceDocument: any = {};
                    if (paymentId) Object.assign(referenceDocument, { payment: { connect: { id: paymentId } } });

                    const createdDibursement = await tx.dibursement.create({
                        data: {
                            date,
                            amount,
                            amountType,
                            categoryId: category.id,
                            natureId: nature.id,
                            sourceId,
                            userActionId: clientOrSupplierId,
                            paymentType,
                            checkNumber,
                            period,
                            infos: comment || "",
                            companyId,
                            ...(purchaseOrderId && { referencePurchaseOrderId: purchaseOrderId, projectId }),
                            ...referenceDocument
                        }
                    });

                    await tx.notification.create({
                        data: {
                            type: 'ALERT',
                            for: 'DISBURSEMENT',
                            message: `${user.name} a réalisé un décaissement de ${formatNumber(amount)} ${category.company.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} ».\n\nCommentaire :\n${comment}`,
                            paymentDibursement: { connect: { id: createdDibursement.id } },
                            company: { connect: { id: createdDibursement.companyId } }
                        }
                    });
                }
            }
        }, {
            timeout: 30000,
            maxWait: 10000,
        });

        if (earlyReturnResponse) {
            return NextResponse.json(earlyReturnResponse);
        }

        return NextResponse.json({ state: "success", message: "Import Excel effectué avec succès." }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur import Excel:", error);
        return NextResponse.json(
            { state: "error", message: "Erreur lors de l'import Excel." },
            { status: 500 }
        );
    }
}