import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");
    const id = getIdFromUrl(req.url, "last") as string;

    const type = req.nextUrl.searchParams.get("type")?.trim() ?? "";


    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    const categories = await prisma.transactionCategory.findMany({
        where: {
            type: type === "receipt" ? $Enums.TransactionType.RECEIPT : $Enums.TransactionType.DISBURSEMENT,
            companyId: id
        },
        include: {
            natures: true
        }
    });


    return NextResponse.json({
        state: "success",
        data: categories,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    const deletedCategory = await prisma.transactionCategory.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedCategory,
    }, { status: 200 })
}
