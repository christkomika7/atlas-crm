import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, "last") as string;
    const lessorSpace = req.nextUrl.searchParams.get("lessorSpace") ?? "";


    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    if (lessorSpace) {
        const datas = await prisma.lessorType.findMany({
            where: {
                companyId: id,
                type: lessorSpace === "private" ? $Enums.LessorSpace.PRIVATE : $Enums.LessorSpace.PUBLIC
            },
        });

        return NextResponse.json({
            state: "success",
            data: datas,
        }, { status: 200 })
    }

    const datas = await prisma.lessorType.findMany({
        where: {
            companyId: id,
        },
    });

    return NextResponse.json({
        state: "success",
        data: datas,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", ["CREATE", "MODIFY"]);

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
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const lessorType = await prisma.lessorType.findUnique({
        where: { id },
        include: {
            billboards: true
        }
    });

    if (lessorType && lessorType.billboards.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Supprimez d'abord les panneaux associés à ce type de bailleur.",
        }, { status: 409 });
    }

    const data = await prisma.lessorType.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: data,
    }, { status: 200 })
}
