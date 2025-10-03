import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber, getIdFromUrl } from "@/lib/utils";
import { paymentSchema, PaymentSchemaType } from "@/lib/zod/payment.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "CREATE");
    const id = getIdFromUrl(req.url, 2) as string;
    const res = await req.json();

    const data = parseData<PaymentSchemaType>(paymentSchema, {
        ...res,
        date: new Date(res.date),
    }) as PaymentSchemaType;

    try {
        const { payment, invoice } = await prisma.$transaction(async (tx) => {
            const invoiceExist = await tx.invoice.findUnique({
                where: { id },
                select: {
                    id: true,
                    payee: true,
                    totalTTC: true,
                    isPaid: true,
                    company: { select: { id: true, currency: true } },
                },
            });

            if (!invoiceExist) {
                throw new Error("Identifiant de facture invalide.");
            }

            if (invoiceExist.isPaid) {
                throw new Error("Cette facture est déjà réglée et ne peut pas recevoir de nouveau paiement.");
            }

            const payee = new Decimal(invoiceExist.payee);
            const total = new Decimal(invoiceExist.totalTTC);
            const remaining = total.minus(payee);
            const newAmount = new Decimal(data.amount);

            // Vérif dépassement
            if (!data.isPaid && newAmount.gt(remaining)) {
                throw new Error(
                    `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${invoiceExist.company.currency}).`
                );
            }

            const hasCompletedPayment =
                data.isPaid || payee.add(newAmount).gte(total.minus(0.01));

            // 💾 Création du paiement
            const payment = await tx.payment.create({
                data: {
                    amount: String(data.isPaid ? remaining : data.amount),
                    paymentMode: data.mode,
                    infos: data.information,
                    invoice: { connect: { id } },
                },
            });

            // 🔄 Mise à jour facture
            const invoice = await tx.invoice.update({
                where: { id },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: String(data.isPaid ? total : payee.add(newAmount)),
                },
                include: {
                    company: true,
                    client: true,
                },
            });

            return { payment, invoice };
        });


        // await prisma.receipt.create({
        //     data: {
        //         date: payment.createdAt,
        //         // categorie
        //         // nature depend de categorie
        //         amount: new Decimal(data.amount).toString(),
        //         // amountType: "HT"| "TTC",
        //         // paymentType,
        //         // checkNumber,
        //         // source
        //         referenceInvoice: {
        //             connect: {
        //                 id: invoice.id
        //             }
        //         },

        //     }
        // });

        return NextResponse.json(
            { state: "success", message: "Le paiement a été effectué avec succès." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Erreur paiement:", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de la création du paiement." },
            { status: 500 }
        );
    }
}
