import { NextResponse, type NextRequest } from "next/server";
import { getIdFromUrl } from "@/lib/utils";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    await checkAccess(["SETTING"], "READ");

    const id = getIdFromUrl(req.url, 2) as string;

    const profile = await prisma.profile.findUnique({
        where: {
            id
        }, include: {
            user: true,
            company: true,
            permissions: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: profile,
        message: "",
    }, { status: 200 })
}
