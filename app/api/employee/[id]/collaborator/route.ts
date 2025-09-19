import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["CLIENTS", "PROJECTS"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const users = await prisma.user.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: users,
        message: "",
    }, { status: 200 })
}