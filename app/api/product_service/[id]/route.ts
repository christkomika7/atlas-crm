import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { $Enums, Prisma, ProductServiceType, User } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { editProductServiceSchema, EditProductServiceSchemaType } from "@/lib/zod/product-service.schema";

import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "MODIFY");

    const id = getIdFromUrl(req.url, "last") as string;

    const productServices = await prisma.productService.findMany({
        where: { companyId: id },
        orderBy: {
            createdAt: "desc"
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: productServices,
        },
        { status: 200 }
    );
}


export async function POST(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "READ");

    const id = getIdFromUrl(req.url, "last") as string;

    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const rawLimit = req.nextUrl.searchParams.get("limit") ?? "";
    const rawFilter = (req.nextUrl.searchParams.get("filter") ?? null) as $Enums.ProductServiceType | null;

    // pagination defaults / constraints
    const DEFAULT_LIMIT = 50;
    const MAX_LIMIT = 200;
    const DEFAULT_PAGE_SIZE = DEFAULT_LIMIT;

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

    // determine take: prefer explicit take, else use rawLimit or DEFAULT_PAGE_SIZE
    let take = DEFAULT_PAGE_SIZE;
    if (rawTake) {
        const parsedTake = parseInt(rawTake, 10);
        if (!Number.isNaN(parsedTake) && parsedTake > 0) {
            take = Math.min(parsedTake, MAX_LIMIT);
        }
    } else if (rawLimit) {
        const parsedLimit = Number(rawLimit);
        if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
            take = Math.min(parsedLimit, MAX_LIMIT);
        }
    }

    const where: any = { companyId: id };

    if (rawFilter === "PRODUCT" || rawFilter === "SERVICE") {
        where.type = rawFilter;
    }

    if (search) {
        const searchTerms = search.split(/\s+/).filter(Boolean);
        where.OR = [
            {
                designation: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                OR: searchTerms.map((term: string) => ({
                    description: {
                        contains: term,
                        mode: "insensitive",
                    },
                })),
            },
        ];
    }

    try {
        // total count for pagination meta
        const total = await prisma.productService.count({
            where,
        });

        const productServices = await prisma.productService.findMany({
            where,
            include: { company: true },
            skip,
            take,
            orderBy: { createdAt: "asc" },
        });

        const returned = productServices.length;
        const hasMore = skip + returned < total;
        const page = take > 0 ? Math.floor(skip / take) + 1 : 1;
        const totalPages = take > 0 ? Math.ceil(total / take) : 1;

        return NextResponse.json(
            {
                state: "success",
                data: productServices,
                meta: {
                    total,
                    skip,
                    take,
                    returned,
                    page,
                    totalPages,
                    hasMore,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur POST /api/product-services:", error);
        return NextResponse.json(
            {
                state: "error",
                message: "Erreur lors de la récupération des produits/services.",
            },
            { status: 500 }
        );
    }
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
        hasTax: data.hasTax,
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
        include: { company: true }
    });

    if (!productService) {
        return NextResponse.json({
            message: "L'identifiant est invalide.",
            state: "error",
        }, { status: 400 })
    }

    await checkAccessDeletion($Enums.DeletionType.PRODUCT_SERVICES, [id], productService.company.id)

    const deletedProductService = await prisma.productService.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        message: `Le ${deletedProductService.type === "PRODUCT" ? "produit" : "service"} à été supprimé avec succès.`,
    }, { status: 200 }
    )
}