import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { natureSchema, NatureSchemaType } from "@/lib/zod/transaction.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");

    const formData = await req.json();

    const data = parseData<NatureSchemaType>(natureSchema, {
        ...formData,
    }) as NatureSchemaType;


    const natureExist = await prisma.transactionNature.findUnique({
        where: { name: data.name }
    });

    if (natureExist) {
        return NextResponse.json({
            status: "error",
            message: "Ce nom est déjà pris.",
        }, { status: 400 });
    }

    try {
        const createdNature = await prisma.transactionNature.create({
            data: {
                name: data.name,
                category: {
                    connect: {
                        id: data.categoryId
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    },
                }
            }
        });
        return NextResponse.json({
            status: "success",
            message: "La nature de la transaction a été ajouté avec succès.",
            data: createdNature,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de la nature de la transaction.",
        }, { status: 500 });
    }
}