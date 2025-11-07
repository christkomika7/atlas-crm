import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;



    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }
    const objects = await prisma.fiscalObject.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: objects,
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

    const deletedObject = await prisma.fiscalObject.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedObject,
    }, { status: 200 })
}
