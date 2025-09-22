import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { paymentSchema, PaymentSchemaType } from "@/lib/zod/payment.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "CREATE");
    const id = getIdFromUrl(req.url, 2) as string;

    const res = await req.json();

    const invoiceExist = await prisma.invoice.findUnique({ where: { id } });

    if (!invoiceExist) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 400 });
    }

    const data = parseData<PaymentSchemaType>(paymentSchema,
        { ...res, date: new Date(res.date) }
    ) as PaymentSchemaType;

    try {
        const [createdPayment] = await prisma.$transaction([
            prisma.payment.create({
                data: {
                    amount: String(data.amount),
                    paymentMode: data.mode,
                    infos: data.information,
                    invoice: {
                        connect: {
                            id: id
                        }
                    }
                }
            }),

            prisma.invoice.update({
                where: { id },
                data: {
                    isPaid: true,
                    // payee: data.isPaid ? invoiceExist.totalTTC : 
                }
            })

        ]);

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création du payment.",
        }, { status: 500 });
    }
}