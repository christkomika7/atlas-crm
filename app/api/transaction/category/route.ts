import { checkAccess } from "@/lib/access";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { categorySchema, CategorySchemaType } from "@/lib/zod/transaction.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "CREATE");

    const formData = await req.json();

    const data = parseData<CategorySchemaType>(categorySchema, {
        ...formData,
    }) as CategorySchemaType;


    const categoryExist = await prisma.transactionCategory.findUnique({
        where: { name: data.name }
    });

    if (categoryExist) {
        return NextResponse.json({
            status: "error",
            message: "Ce nom de catégorie est déjà pris.",
        }, { status: 400 });
    }

    try {
        const createdCategory = await prisma.transactionCategory.create({
            data: {
                name: data.name,
                type: data.type === "receipt" ? $Enums.TransactionType.RECEIPT : $Enums.TransactionType.DISBURSEMENT,
                company: {
                    connect: {
                        id: data.companyId
                    }
                }
            }
        });
        return NextResponse.json({
            status: "success",
            message: "La catégorie a été ajouté avec succès.",
            data: createdCategory,
        });

    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout de la catégorie.",
        }, { status: 500 });
    }
}