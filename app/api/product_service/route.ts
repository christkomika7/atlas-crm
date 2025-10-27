import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { getFirstValidCompanyId } from "@/lib/utils";
import { productServiceSchema, ProductServiceSchemaType } from "@/lib/zod/product-service.schema";
import { User } from "better-auth";
import { NextResponse, type NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "CREATE") as User;

    const formData = await req.json();

    const data = parseData<ProductServiceSchemaType>(productServiceSchema, {
        ...formData
    }) as ProductServiceSchemaType;

    const [companyExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
    ]);

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    try {
        const createdProductService = await prisma.productService.create({
            data: {
                type: data.itemType,
                reference: data.reference,
                category: data.category,
                hasTax: data.hasTax,
                description: data.description ?? "",
                designation: data.designation,
                unitPrice: data.unitPrice,
                unitType: data.unitType,
                cost: data.cost,
                quantity: parseInt(data.quantity),
                company: {
                    connect: {
                        id: data.companyId
                    }
                },

            },
        });

        return NextResponse.json({
            status: "success",
            message: `Le ${data.itemType === "PRODUCT" ? "produit" : "service"} a été ajouté avec succès.`,
            data: createdProductService,
        });

    } catch (error) {

        return NextResponse.json({
            status: "error",
            message: `Erreur lors de l'ajout du ${data.itemType === "PRODUCT" ? "produit" : "service"}.`,
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const productServices = await prisma.productService.findMany({
        where: {
            id: { in: ids }
        },
        include: {
            company: true
        }
    })

    const companyId = getFirstValidCompanyId(productServices);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    await checkAccessDeletion($Enums.DeletionType.PRODUCT_SERVICES, ids, companyId);

    await prisma.productService.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    return NextResponse.json({
        state: "success",
        message: "Tous les éléments sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}