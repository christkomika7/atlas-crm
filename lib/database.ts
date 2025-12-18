import { Prisma } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import { removePath } from "./file";


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


