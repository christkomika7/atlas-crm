import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    const natures = await prisma.transactionNature.findMany({
        where: {
            categoryId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: natures,
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

    const deletedNature = await prisma.transactionNature.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedNature,
    }, { status: 200 })
}
