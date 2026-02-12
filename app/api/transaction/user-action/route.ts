import { checkAccess, sessionAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { UserActionSchemaType, userActionSchema } from "@/lib/zod/transaction.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);
    const { userId } = await sessionAccess();

    if (!result.authorized || !userId) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.json();

    const data = parseData<UserActionSchemaType>(userActionSchema, {
        ...formData,
    }) as UserActionSchemaType;

    const companyExist = await prisma.company.findUnique({
        where: { id: data.companyId }
    });

    const userActionAlreadyExist = await prisma.userAction.findFirst({
        where: {
            natureId: data.natureId,
            name: data.name,
            companyId: data.companyId
        }
    })
    if (userActionAlreadyExist) {
        return NextResponse.json({
            status: "error",
            message: "Ce client est déjà utilisé.",
        }, { status: 400 });
    }



    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Cette entreprise n'existe pas.",
        }, { status: 400 });
    }



    try {
        const createdUserAction = await prisma.userAction.create({
            data: {
                name: data.name,
                nature: {
                    connect: {
                        id: data.natureId
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
            },
        });
        return NextResponse.json({
            status: "success",
            message: "Le Client | Fournisseur | Tiers a été ajouté avec succès.",
            data: createdUserAction,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du  Client | Fournisseur | Tiers ",
        }, { status: 500 });
    }
}