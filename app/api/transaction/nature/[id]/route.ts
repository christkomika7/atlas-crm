import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }


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
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }


    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    const nature = await prisma.transactionNature.findUnique({
        where: { id },
        include: {
            allocations: true
        }
    });

    if (nature && nature.allocations.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Supprimez d'abord les allocations associées à nature de transaction.",
        }, { status: 409 });
    }

    const deletedNature = await prisma.transactionNature.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedNature,
    }, { status: 200 })
}
