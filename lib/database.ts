import { Prisma, Role } from "@/lib/generated/prisma"; // adapte ce chemin si besoin
import { auth } from "./auth";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { removePath } from "./file";
import prisma from "./prisma";

type User = {
    name: string;
    email: string;
    password: string;
    role: Role
};

export async function createUser(data: User) {
    try {

        const result = await auth.api.signUpEmail({
            body: {
                name: data.name,
                role: data.role,
                email: data.email,
                emailVerified: true,
                password: data.password
            }
        })

        return result.user
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return NextResponse.json({
                status: "fail",
                message: "Une erreur est survenue lors de la création du nouveau collaborateur",
            }, { status: error.statusCode ?? 400 });
        }
        console.error("Erreur inattendue lors de createUser:", error);
        return NextResponse.json({
            status: "error",
            message: "Une erreur inattendue est survenue.",
        }, { status: 500 });
    }
}


export async function checkIfExists<
    Delegate extends { findFirst(args: any): Promise<any> },
    Args extends Parameters<Delegate["findFirst"]>[0] & { where: unknown }
>(
    model: Delegate,
    args: Prisma.SelectSubset<Args, Args>,
    entityName: string,
    value: string,
    deletePath?: string[]
) {
    const existing = await model.findFirst(args);

    if (existing) {
        if (deletePath && deletePath.length > 0) {
            await removePath(deletePath)
        }
        return NextResponse.json(
            {
                message: `Un(e) ${entityName} portant ${value} existe déjà.`,
                state: "error"
            },
            { status: 409 }
        );
    }

    return null;
}

export async function checkData<
    Delegate extends { findUnique(args: any): Promise<any> },
    Args extends Parameters<Delegate["findUnique"]>[0] & { where: unknown }
>(
    model: Delegate,
    args: Prisma.SelectSubset<Args, Args>,
    entityName: string
): Promise<any | NextResponse> {
    const item = await model.findUnique(args);

    if (!item) {
        console.warn(`[NOT FOUND] ${entityName} introuvable avec :`, args.where);

        return NextResponse.json(
            {
                status: "error",
                message: `Aucun ${entityName} trouvé pour ces critères.`,
            },
            { status: 404 }
        );
    }

    return item;
}

export async function initializeCurrentCompany(currentCompany: string, createdUserIds: string[]) {
    // Mise à jour des users créés sans currentCompany
    await prisma.user.updateMany({
        where: {
            id: { in: createdUserIds },
            currentCompany: null,
        },
        data: {
            currentCompany,
        },
    });

    // Mise à jour de l'admin spécifique si currentCompany est null
    await prisma.user.updateMany({
        where: {
            email: "ralph.pinto@atlasmediaafrica.com",
            role: "ADMIN",
            currentCompany: null,
        },
        data: {
            currentCompany,
        },
    });
}

