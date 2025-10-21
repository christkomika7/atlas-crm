import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { baseSchema, BaseSchemaType } from "@/lib/zod/base-type.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");
    const formData = await req.json();

    const data = parseData<BaseSchemaType>(baseSchema, {
        ...formData,
    }) as BaseSchemaType;


    const exist = await prisma.lessorType.findUnique({
        where: { name: data.name }
    });

    if (exist) {
        return NextResponse.json({
            status: "error",
            message: "La valeur que vous avez inserée existe déjà.",
        }, { status: 400 });
    }

    try {
        const createdData = await prisma.lessorType.create({
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
            message: "La valeur a été ajouté avec succès.",
            data: createdData,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout.",
        }, { status: 500 });
    }
}