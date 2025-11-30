import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("PRODUCT_SERVICES", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, 2) as string;

    const productService = await prisma.productService.findUnique({
        where: {
            id
        },
        include: {
            company: true
        }
    });


    if (!productService) {
        return NextResponse.json({
            status: "error",
            message: "Aucune donnée trouvée.",
        }, { status: 404 });
    }

    const reference = generateId()


    try {
        const createdProductService = await prisma.productService.create({
            data: {
                type: productService.type,
                reference: reference,
                category: productService.category,
                hasTax: productService.hasTax,
                description: productService.description ?? "",
                designation: productService.designation,
                unitPrice: productService.unitPrice,
                unitType: productService.unitType,
                cost: productService.cost,
                quantity: productService.quantity,
                company: {
                    connect: {
                        id: productService.companyId
                    }
                },
            }
        })

        return NextResponse.json({
            status: "success",
            message: `Le ${productService?.type === "PRODUCT" ? "produit" : "service"} a été ajouté avec succès.`,
            data: createdProductService,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: `Erreur lors de la duplication du ${productService?.type === "PRODUCT" ? "produit" : "service"}.`,
        }, { status: 500 });
    }

    return NextResponse.json({
        state: "success",
        data: productService,
    }, { status: 200 })
}


export async function GET(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const productService = await prisma.productService.findUnique({
        where: {
            id
        },
    })

    return NextResponse.json({
        state: "success",
        data: productService,
    }, { status: 200 })
}