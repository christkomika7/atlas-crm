import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { sourceSchema, SourceSchemaType } from "@/lib/zod/transaction.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");

    const formData = await req.json();

    const data = parseData<SourceSchemaType>(sourceSchema, {
        ...formData,
    }) as SourceSchemaType;


    const sourceExist = await prisma.source.findUnique({
        where: { name: data.name }
    });

    if (sourceExist) {
        return NextResponse.json({
            status: "error",
            message: "Ce nom  est déjà pris.",
        }, { status: 400 });
    }

    try {
        const createdSource = await prisma.source.create({
            data: {
                name: data.name,
                company: {
                    connect: {
                        id: data.companyId
                    }
                }
            }
        });
        return NextResponse.json({
            status: "success",
            message: "La source a été ajouté avec succès.",
            data: createdSource,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de la source.",
        }, { status: 500 });
    }
}