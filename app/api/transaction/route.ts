import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { DeletedTransactions } from "@/types/transaction.type";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  checkAccess(["TRANSACTION"], "MODIFY");

  const { data }: { data: DeletedTransactions[] } = await req.json();

  const receipts = data.filter((item) => item.transactionType === "RECEIPT");
  const disbursement = data.filter(
    (item) => item.transactionType === "DISBURSEMENT",
  );

  try {
    await prisma.$transaction([
      ...(receipts.length > 0
        ? [
            prisma.receipt.deleteMany({
              where: { id: { in: receipts.map((item) => item.id) } },
            }),
          ]
        : []),

      ...(disbursement.length > 0
        ? [
            prisma.dibursement.deleteMany({
              where: { id: { in: disbursement.map((item) => item.id) } },
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
