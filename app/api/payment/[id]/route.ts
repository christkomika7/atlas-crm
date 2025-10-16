import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
    await checkAccess(["INVOICES", "PURCHASE_ORDER"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const payment = await prisma.payment.findUnique({
        where: { id },
    });

    if (!payment) {
        return NextResponse.json({
            message: "Paiement introuvable.",
            state: "error",
        }, { status: 400 })
    }

    try {
        if (payment?.invoiceId) {
            await prisma.$transaction([
                prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        isPaid: false,
                        payee: {
                            decrement: payment.amount
                        }
                    }
                }),
                prisma.receipt.delete({
                    where: {
                        paymentId: payment.id
                    }
                }),
                prisma.payment.delete({ where: { id } })
            ]);
        } else {
            await prisma.$transaction([
                prisma.invoice.update({
                    where: { id: payment.purchaseOrderId as string },
                    data: {
                        isPaid: false,
                        payee: {
                            decrement: payment.amount
                        }
                    }
                }),
                prisma.dibursement.delete({
                    where: {
                        paymentId: payment.id
                    }
                }),
                prisma.payment.delete({ where: { id } })
            ]);
        }


        return NextResponse.json({
            state: "success",
            message: "Paiement supprimé avec succès.",
        }, { status: 200 }
        )
    } catch (error) {
        return NextResponse.json({
            state: "error",
            message: "La suppression du paiment a échoué.",
        }, { status: 500 }
        )

    }


}