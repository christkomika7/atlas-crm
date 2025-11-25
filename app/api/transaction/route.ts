import { checkAccess } from "@/lib/access";
import { getSession } from "@/lib/auth";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { DeletedTransactions } from "@/types/transaction.type";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("TRANSACTION", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const companyId = req.nextUrl.searchParams.get("companyId")?.trim() ?? "";
  const { data }: { data: DeletedTransactions[] } = await req.json();

  const receipts = data.filter((item) => item.transactionType === "RECEIPT");
  const disbursements = data.filter(
    (item) => item.transactionType === "DISBURSEMENT",
  );


  if (!companyId) {
    return NextResponse.json({
      status: "error",
      message: "Aucun entreprise trouvée.",
    }, { status: 404 });
  }

  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id
    },
  });

  if (!user) {
    return NextResponse.json({
      message: "L'identifiant est invalide.",
      state: "error",
    }, { status: 400 })
  }


  if (session?.user.role !== "ADMIN") {
    for (const receipt of receipts) {
      await prisma.$transaction([
        prisma.receipt.update({
          where: { id: receipt.id },
          data: { hasDelete: true }
        }),
        prisma.deletion.create({
          data: {
            type: $Enums.DeletionType.RECEIPTS,
            recordId: receipt.id,
            company: {
              connect: {
                id: companyId
              }
            }
          }
        })
      ]);

    }

    for (const disbursement of disbursements) {
      await prisma.$transaction([
        prisma.dibursement.update({
          where: { id: disbursement.id },
          data: { hasDelete: true }
        }),
        prisma.deletion.create({
          data: {
            type: $Enums.DeletionType.DISBURSEMENTS,
            recordId: disbursement.id,
            company: {
              connect: {
                id: companyId
              }
            }
          }
        })
      ]);

    }

    return NextResponse.json({
      state: "success",
      message: "Suppression en attente de validation.",
    }, { status: 200 })
  }


  try {
    await prisma.$transaction(async (tx) => {
      for (const receipt of receipts) {
        const receiptExist = await tx.receipt.findUnique({
          where: { id: receipt.id }, include: {
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

        await tx.receipt.delete({ where: { id: receipt.id } })
      }

      for (const disbursement of disbursements) {
        const disbursementExist = await tx.dibursement.findUnique({
          where: { id: disbursement.id }, include: {
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
        await tx.dibursement.delete({ where: { id: disbursementExist.id } })
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        state: "error",
        message:
          "Une erreur est survenue lors de la suppression d'une ou des transactions.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ state: "success", message: "" }, { status: 200 });
}
