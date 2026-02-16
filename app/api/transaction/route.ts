import { checkAccess } from "@/lib/access";
import { getSession } from "@/lib/auth";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { DeletedTransactions } from "@/types/transaction.type";
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


  try {
    const allTransactionIds = [...receipts.map(r => r.id), ...disbursements.map(d => d.id)];

    const existingDeletions = await prisma.deletion.findMany({
      where: {
        recordId: {
          in: allTransactionIds
        },
        isValidate: false
      }
    });

    if (existingDeletions.length > 0) {
      return NextResponse.json({
        state: "error",
        message: "Suppression en attente de validation.",
      }, { status: 200 })
    }

    // Traiter les encaissements
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
            user: {
              connect: {
                id: user.id
              }
            },
            company: {
              connect: {
                id: companyId
              }
            }
          }
        })
      ]);
    }

    // Traiter les décaissements
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
            user: {
              connect: {
                id: user.id
              }
            },
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
}