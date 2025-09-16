import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { contractSchema, ContractSchemaType } from "@/lib/zod/contract.schema";
import { NextResponse, type NextRequest } from "next/server";

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

    const billboards = await prisma.billboard.findMany({
        where: {
            cityId: data.city,
            typeId: data.billboardType,
            placementId: {
                in: data.area,
            },
            locationStart: {
                gte: data.range.from,
            },
            locationEnd: {
                lte: data.range.to,
            },
        },
    });

    console.log({
        data: billboards.map(billboard => ({
            ...billboard,
            contractDuration: [billboard?.contractStart, billboard?.contractEnd],
            locationDuration: [billboard?.locationStart, billboard?.locationEnd],
        }))
    })

    return NextResponse.json(
        {
            state: "success",
            data: billboards.map(billboard => ({
                ...billboard,
                contractDuration: [billboard?.contractStart, billboard?.contractEnd],
                locationDuration: [billboard?.locationStart, billboard?.locationEnd],
            })),
        },
        { status: 200 }
    );
}