import { sessionAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { areaSchema, AreaSchemaType } from "@/lib/zod/area.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }
    const formData = await req.json();

    const data = parseData<AreaSchemaType>(areaSchema, {
        ...formData,
    }) as AreaSchemaType;

    const areaExist = await prisma.area.findUnique({
        where: { name: data.name }
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