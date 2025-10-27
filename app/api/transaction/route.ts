import { checkAccess } from "@/lib/access";
import { getSession } from "@/lib/auth";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { DeletedTransactions } from "@/types/transaction.type";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  checkAccess(["TRANSACTION"], "MODIFY");

  const { data }: { data: DeletedTransactions[] } = await req.json();

  const receipts = data.filter((item) => item.transactionType === "RECEIPT");
  const disbursements = data.filter(
    (item) => item.transactionType === "DISBURSEMENT",
  );

  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id
    },
    include: {
      company: true
    }
  });

  if (!user?.company?.id) {
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
                id: user.company.id
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
                id: user.company.id
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
    await prisma.$transaction([
      ...(receipts.length > 0
        ? [
          prisma.receipt.deleteMany({
            where: { id: { in: receipts.map((item) => item.id) } },
          }),
        ]
        : []),

      ...(disbursements.length > 0
        ? [
          prisma.dibursement.deleteMany({
            where: { id: { in: disbursements.map((item) => item.id) } },
          }),
        ]
        : []),
    ]);
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
