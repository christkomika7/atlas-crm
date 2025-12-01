import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { citySchema, CitySchemaType } from "@/lib/zod/city.schema";
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

    const data = parseData<CitySchemaType>(citySchema, {
        ...formData,
    }) as CitySchemaType;


    const cityExist = await prisma.city.findUnique({
        where: { name: data.name }
    });

    if (cityExist) {
        return NextResponse.json({
            status: "error",
            message: "La valeur que vous avez inserée existe déjà.",
        }, { status: 400 });
    }

    try {
        const createdCity = await prisma.city.create({
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
            message: "La ville a été ajouté avec succès.",
            data: createdCity,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de la ville.",
        }, { status: 500 });
    }
}