import { Role } from "@/lib/generated/prisma"
import prisma from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { checkAccess } from "@/lib/access";

export async function POST(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "CREATE");
    const formData: { data?: string[] } = await req.json();

    const [employees, currentEmployees] = await prisma.$transaction([
        prisma.user.findMany({
            where: {
                companyId: null,
                role: Role.USER,
            },
            select: {
                id: true,
                image: true,
                name: true,
            },
        }),
        prisma.user.findMany({
            where: {
                role: Role.USER,
                ...((Array.isArray(formData?.data) && formData.data.length > 0) && {
                    OR: formData.data.map(idPart => ({
                        id: {
                            contains: idPart,
                        },
                    })),
                }),
                companyId: {
                    not: null
                }
            },
            select: {
                id: true,
                image: true,
                name: true,
            },
        }),
    ]);

    return NextResponse.json({
        state: "success",
        data: [...employees, ...currentEmployees],
    }, { status: 200 })
}