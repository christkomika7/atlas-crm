import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, "last") as string;

    const type = req.nextUrl.searchParams.get("type")?.trim() ?? "";


    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }
    if (!type) {
        const categories = await prisma.transactionCategory.findMany({
            where: {
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

    const categories = await prisma.transactionCategory.findMany({
        where: {
            type: type === "receipt" ? $Enums.TransactionType.RECEIPT : $Enums.TransactionType.DISBURSEMENT,
            companyId: id
        },
        include: {
            natures: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return NextResponse.json({
        state: "success",
        data: categories,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    const category = await prisma.transactionCategory.findUnique({
        where: { id },
        include: {
            natures: true
        }
    });

    if (category && category.natures.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Supprimez d'abord les natures de transactions associées à cette catégorie de transaction.",
        }, { status: 409 });
    }

    const deletedCategory = await prisma.transactionCategory.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedCategory,
    }, { status: 200 })
}
