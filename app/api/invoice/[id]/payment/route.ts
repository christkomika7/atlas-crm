import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber, getIdFromUrl } from "@/lib/utils";
import { paymentSchema, PaymentSchemaType } from "@/lib/zod/payment.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "CREATE");
    const id = getIdFromUrl(req.url, 2) as string;

    const res = await req.json();

    const invoiceExist = await prisma.invoice.findUnique({
        where: { id },
        select: {
            payee: true,
            totalTTC: true,
            isPaid: true,
            company: { select: { currency: true } },
        },
    });

    if (!invoiceExist) {
        return NextResponse.json(
            {
                state: "error",
                message: "Identifiant invalide.",
            },
            { status: 400 }
        );
    }


    if (invoiceExist.isPaid) {
        return NextResponse.json(
            {
                state: "error",
                message: "Cette facture est déjà réglée et ne peut pas recevoir de nouveau paiement.",
            },
            { status: 409 }
        );

    }


    const data = parseData<PaymentSchemaType>(paymentSchema, {
        ...res,
        date: new Date(res.date),
    }) as PaymentSchemaType;

    try {
        const payee = Number(invoiceExist.payee);
        const total = Number(invoiceExist.totalTTC);
        const remaining = total - payee;

        const hasCompletedPayment =
            data.isPaid || Math.abs(data.amount + payee - total) < 0.01;

        if (!data.isPaid && data.amount > remaining) {
            return NextResponse.json(
                {
                    state: "error",
                    message: `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining
                    )} ${invoiceExist.company.currency}).`,
                },
                { status: 422 }
            );

        }

        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    amount: String(data.isPaid ? remaining : data.amount),
                    paymentMode: data.mode,
                    infos: data.information,
                    invoice: {
                        connect: { id },
                    },
                },
            }),

            prisma.invoice.update({
                where: { id },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: String(data.isPaid ? total : payee + data.amount),
                },
            }),
        ]);

        return NextResponse.json(
            {
                state: "success",
                message: "Le paiement a été effectué avec succès.",
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                state: "error",
                message: "Erreur lors de la création du paiement.",
            },
            { status: 500 }
        );
    }
}
