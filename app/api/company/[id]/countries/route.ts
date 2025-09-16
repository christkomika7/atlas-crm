import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const id = getIdFromUrl(req.url, 2) as string;

    await checkAccess(["DASHBOARD"], "READ");
    const data = await req.json()

    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        return NextResponse.json(
            { message: `Identifiant inexistant.`, state: "error" },
            { status: 401 }
        )
    }

    if (data.currentCompany) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                currentCompany: data.currentCompany
            }
        })
    }

    const isAdmin = user?.role === "ADMIN";

    if (isAdmin) {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                country: true,
                companyName: true,
                currency: true,
            }
        })
        return NextResponse.json({
            state: "success",
            data: companies,
            message: "",
        }, { status: 200 })
    }

    const company = await prisma.company.findFirst({
        where: {
            employees: {
                some: {
                    id
                }
            }
        },
        select: {
            id: true,
            country: true,
            companyName: true,
            currency: true,
        }
    })

    return NextResponse.json({
        state: "success",
        data: company,
        message: "",
    }, { status: 200 })
}