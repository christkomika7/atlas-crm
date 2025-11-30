import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
    const result = await checkAccess(["INVOICES", 'PURCHASE_ORDER'], "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, "last") as string;

    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            invoice: {
                include: {
                    client: true
                }
            },
            purchaseOrder: {
                include: {
                    supplier: true
                }
            }
        }
    });

    if (!payment) {
        return NextResponse.json({
            message: "Paiement introuvable.",
            state: "error",
        }, { status: 400 });
    }

    try {
        const ops: any[] = [];

        if (payment.invoiceId) {
            ops.push(
                prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        isPaid: false,
                        payee: { decrement: payment.amount }
                    }
                })
            );

            ops.push(
                prisma.receipt.deleteMany({
                    where: { paymentId: payment.id }
                })
            );

            if (payment.invoice?.clientId) {
                ops.push(
                    prisma.client.update({
                        where: { id: payment.invoice.clientId },
                        data: {
                            due: { increment: payment.amount },
                            paidAmount: { decrement: payment.amount }
                        }
                    })
                );
            }

            if (payment.invoice?.projectId) {
                ops.push(
                    prisma.project.update({
                        where: { id: payment.invoice.projectId },
                        data: {
                            balance: { decrement: payment.amount }
                        }
                    })
                );
            }

            ops.push(prisma.payment.delete({ where: { id: payment.id } }));

        } else if (payment.purchaseOrderId) {
            ops.push(
                prisma.purchaseOrder.update({
                    where: { id: payment.purchaseOrderId },
                    data: {
                        isPaid: false,
                        payee: { decrement: payment.amount }
                    }
                })
            );

            if (payment.purchaseOrder?.supplierId) {
                ops.push(
                    prisma.supplier.update({
                        where: { id: payment.purchaseOrder.supplierId },
                        data: {
                            due: { increment: payment.amount },
                            paidAmount: { decrement: payment.amount }
                        }
                    })
                );
            }

            ops.push(
                prisma.dibursement.deleteMany({
                    where: { paymentId: payment.id }
                })
            );

            ops.push(prisma.payment.delete({ where: { id: payment.id } }));

        } else {
            ops.push(prisma.receipt.deleteMany({ where: { paymentId: payment.id } }));
            ops.push(prisma.dibursement.deleteMany({ where: { paymentId: payment.id } }));
            ops.push(prisma.payment.delete({ where: { id: payment.id } }));
        }

        await prisma.$transaction(ops);

        return NextResponse.json({
            state: "success",
            message: "Paiement supprimé avec succès.",
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur suppression paiement:", error);
        return NextResponse.json({
            state: "error",
            message: "La suppression du paiement a échoué.",
        }, { status: 500 });
    }
}
