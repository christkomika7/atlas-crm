import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { contractSchema, ContractSchemaType } from "@/lib/zod/contract.schema";
import { NextResponse, type NextRequest } from "next/server";

function ensureArray<T = string>(v?: T | T[] | null): T[] | undefined {
    if (v === undefined || v === null) return undefined;
    return Array.isArray(v) ? v : [v];
}

export async function POST(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");

    const formData = await req.json();

    const data = parseData<ContractSchemaType>(contractSchema, {
        ...formData,
        range: {
            from: new Date(formData.range.from),
            to: new Date(formData.range.to),
        },
    }) as ContractSchemaType;

    // Normaliser les valeurs : accepter string ou string[]
    const billboardTypes = ensureArray<string>(data.billboardType as any);
    const cities = ensureArray<string>(data.city as any);
    const areas = ensureArray<string>(data.area as any);

    // Construire le where dynamiquement (les clés undefined sont ignorées par Prisma)
    const where: any = {
        hasDelete: false, // par exemple
    };

    if (billboardTypes && billboardTypes.length > 0) {
        where.typeId = { in: billboardTypes };
    }

    if (cities && cities.length > 0) {
        where.cityId = { in: cities };
    }

    if (areas && areas.length > 0) {
        where.areaId = { in: areas };
    }


    const billboards = await prisma.billboard.findMany({
        where,
    });

    return NextResponse.json(
        {
            state: "success",
            count: billboards.length,
            data: billboards.map((billboard) => ({
                ...billboard,
            })),
        },
        { status: 200 }
    );
}
