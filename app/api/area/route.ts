import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { areaSchema, AreaSchemaType } from "@/lib/zod/area.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess(["BILLBOARDS"], ["CREATE", "MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.json();

    const data = parseData<AreaSchemaType>(areaSchema, {
        ...formData,
    }) as AreaSchemaType;

    const areaExist = await prisma.area.findFirst({
        where: { name: data.name, companyId: data.companyId }
    });

    if (areaExist) {
        return NextResponse.json({
            status: "error",
            message: "La valeur que vous avez inserée existe déjà.",
        }, { status: 400 });
    }

    try {
        const createdArea = await prisma.area.create({
            data: {
                name: data.name,
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                city: {
                    connect: {
                        id: data.cityId
                    }
                }

            }
        });
        return NextResponse.json({
            status: "success",
            message: "Le quartier a été ajouté avec succès.",
            data: createdArea,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du quartier.",
        }, { status: 500 });
    }
}