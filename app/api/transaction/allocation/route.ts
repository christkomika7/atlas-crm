import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { allocationSchema, AllocationSchemaType } from "@/lib/zod/transaction.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const formData = await req.json();

    const data = parseData<AllocationSchemaType>(allocationSchema, {
        ...formData,
    }) as AllocationSchemaType;


    const allocationExist = await prisma.allocation.findFirst({
        where: { name: data.name, companyId: data.companyId }
    });

    if (allocationExist) {
        return NextResponse.json({
            status: "error",
            message: "Ce nom est déjà pris.",
        }, { status: 400 });
    }

    try {
        const createdAllocation = await prisma.allocation.create({
            data: {
                name: data.name,
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                nature: {
                    connect: {
                        id: data.natureId
                    }
                }
            }
        });
        return NextResponse.json({
            status: "success",
            message: "L'allocation a été ajouté avec succès.",
            data: createdAllocation,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de l'allocation.",
        }, { status: 500 });
    }
}