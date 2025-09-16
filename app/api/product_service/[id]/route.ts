import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { Prisma, ProductServiceType, User } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { editProductServiceSchema, EditProductServiceSchemaType } from "@/lib/zod/product-service.schema";

import prisma from "@/lib/prisma";


export async function POST(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;
    const { data }: { data: "PRODUCT" | "SERVICE" } = await req.json();
    const filter: any = {};

    if (!data) {
        const productService = await prisma.productService.findMany({
            where: {
                companyId: id,
            },
            include: {
                company: true
            }
        });

        return NextResponse.json(
            {
                state: "success",
                data: productService,
            },
            { status: 200 }
        );
    }

    if (data === "PRODUCT") {
        Object.assign(filter, {
            type: "PRODUCT"
        });
    } else if (data === "SERVICE") {
        Object.assign(filter, {
            type: "SERVICE",
        });
    }

    const productService = await prisma.productService.findMany({
        where: {
            companyId: id,
            ...filter,
        },
        include: {
            company: true
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: productService,
        },
        { status: 200 }
    );
}

export async function PUT(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "MODIFY") as User;
    const id = getIdFromUrl(req.url, "last") as string;

    await checkData(prisma.productService, { where: { id }, include: { company: true } }, "identifiant") as ProductServiceType;

    const formData = await req.json();

    const data = parseData<EditProductServiceSchemaType>(editProductServiceSchema, {
        ...formData
    }) as EditProductServiceSchemaType;

    const [companyExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const updateData: Prisma.ProductServiceUpdateInput = {
        type: data.itemType,
        reference: data.reference,
        category: data.category,
        description: data.description ?? "",
        designation: data.designation,
        unitPrice: data.unitPrice,
        unitType: data.unitType,
        cost: data.cost,
        quantity: parseInt(data.quantity),
    };

    try {
        const updatedProducyService = await prisma.productService.update({
            where: { id: data.id },
            data: {
                ...updateData,
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
            },
        });

        return NextResponse.json({
            status: "success",
            message: `Le ${data.itemType === "PRODUCT" ? "produit" : "service"} a été modifié avec succès.`,
            data: updatedProducyService,
        });
    } catch (error) {
        console.error({ error });
        return NextResponse.json({
            status: "error",
            message: `Erreur lors de la modification du ${data.itemType === "PRODUCT" ? "produit" : "service"}.`,
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const productService = await prisma.productService.findUnique({
        where: { id },
    });

    if (!productService) {
        return NextResponse.json({
            message: "L'identifiant est invalide.",
            state: "error",
        }, { status: 400 })
    }

    const deletedProductService = await prisma.productService.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        message: `Le ${deletedProductService.type === "PRODUCT" ? "produit" : "service"} à été supprimé avec succès.`,
    }, { status: 200 }
    )
}