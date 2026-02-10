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

    if (data.type === "CLIENT") {
        const userActionAlreadyExist = await prisma.userAction.findFirst({
            where: {
                natureId: data.natureId,
                clientId: data.clientOrSupplierId,
                companyId: data.companyId
            }
        })
        if (userActionAlreadyExist) {
            return NextResponse.json({
                status: "error",
                message: "Ce client est déjà utilisé.",
            }, { status: 400 });
        }
    }
    else {
        const userActionAlreadyExist = await prisma.userAction.findFirst({
            where: {
                natureId: data.natureId,
                supplierId: data.clientOrSupplierId,
                companyId: data.companyId
            }
        })
        if (userActionAlreadyExist) {
            return NextResponse.json({
                status: "error",
                message: "Ce fournisseur est déjà utilisé.",
            }, { status: 400 });
        }
    }


    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Cette entreprise n'existe pas.",
        }, { status: 400 });
    }

    const relation = {};

    if (data.type === "CLIENT") {
        Object.assign(relation, {
            client: {
                connect: {
                    id: data.clientOrSupplierId
                }
            }
        })
    }

    if (data.type === "SUPPLIER") {
        Object.assign(relation, {
            supplier: {
                connect: {
                    id: data.clientOrSupplierId
                }
            }
        })
    }


    try {
        const createdUserAction = await prisma.userAction.create({
            data: {
                type: data.type,
                nature: {
                    connect: {
                        id: data.natureId
                    }
                },
                user: {
                    connect: {
                        id: userId
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                ...relation
            },
            include: {
                client: true,
                supplier: true,
                user: true,
                company: true
            }
        });
        return NextResponse.json({
            status: "success",
            message: data.type === "CLIENT" ? "Le client a été ajouté avec succès." : "Le fournisseur a été ajouté avec succès.",
            data: createdUserAction,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de " + data.type === "CLIENT" ? "client" : "fournisseur.",
        }, { status: 500 });
    }
}