import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { contractSchema, ContractSchemaType } from "@/lib/zod/contract.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.json();

    const data = parseData<ContractSchemaType>(contractSchema, {
        ...formData,
        range: {
            from: new Date(formData.range.from),
            to: new Date(formData.range.to),
        },
    }) as ContractSchemaType;

    const where: any = {
        hasDelete: false,
    };

    if (data.billboardType && data.billboardType.length > 0) {
        where.typeId = { in: data.billboardType };
    }

    if (data.city && data.city.length > 0) {
        where.cityId = { in: data.city };
    }

    if (data.area && data.area.length > 0) {
        where.areaId = { in: data.area };
    }

    const billboards = await prisma.billboard.findMany({
        where,
        include: {
            type: true,
            company: {
                include: {
                    documentModel: true
                }
            }
        }
    });

    const brochures: string[] = billboards.flatMap(billboard =>
        [
            billboard.company.documentModel?.recordFiles[0],
            billboard.company.documentModel?.recordFiles[1],
            billboard.company.documentModel?.recordFiles[2],
            ...billboard.brochures,
            billboard.company.documentModel?.recordFiles[3],
            billboard.company.documentModel?.recordFiles[4],
        ].filter((file): file is string => Boolean(file))
    );


    return NextResponse.json(
        {
            state: "success",
            data: brochures,
        },
        { status: 200 }
    );
}