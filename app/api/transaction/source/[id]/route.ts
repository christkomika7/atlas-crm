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
    const sources = await prisma.source.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: sources,
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

    const deletedSource = await prisma.source.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedSource,
    }, { status: 200 })
}
