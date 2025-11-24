import { NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";

export async function GET() {
    await checkAccess(["SETTING"], "READ");
    const users = await prisma.user.findMany({
        where: {
            role: "USER"
        },
        include: {
            profiles: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: users,
        message: "",
    }, { status: 200 })
}
