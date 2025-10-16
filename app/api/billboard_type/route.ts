import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { billboardTypeSchema, BillboardTypeSchemaType } from "@/lib/zod/billboard-type.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");
    const formData = await req.json();

    const data = parseData<BillboardTypeSchemaType>(billboardTypeSchema, {
        ...formData,
    }) as BillboardTypeSchemaType;


    const billboardTypeExist = await prisma.billboardType.findUnique({
        where: { name: data.name }
    });

    if (billboardTypeExist) {
        return NextResponse.json({
            status: "error",
            message: "La valeur que vous avez inserée existe déjà.",
        }, { status: 400 });
    }

    try {
        const createdBillboardType = await prisma.billboardType.create({
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
            message: "Le type de panneau a été ajouté avec succès.",
            data: createdBillboardType,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du type de panneau.",
        }, { status: 500 });
    }
}