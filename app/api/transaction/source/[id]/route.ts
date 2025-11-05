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

    if (!type) {
        return NextResponse.json({
            state: "success",
            data: [],
        }, { status: 200 })
    }

    const sources = await prisma.source.findMany({
        where: {
            sourceType: type === "check" || type === "bank-transfer" ? $Enums.SourceType.BANK : $Enums.SourceType.CASH,
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
