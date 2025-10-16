import { checkAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { receiptSchema, ReceiptSchemaType } from "@/lib/zod/receipt.schema";
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");

    const res = await req.json();

    const data = parseData<ReceiptSchemaType>(receiptSchema, {
        ...res,
        date: new Date(res.date)
    }) as ReceiptSchemaType;

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) return NextResponse.json({
        status: "error",
        message: "Identifiant invalide",
    }, { status: 404 })

    try {

        const referenceDocument = {};

        switch (data.documentRefType) {
            case 'invoice':
                Object.assign(referenceDocument, {
                    referenceInvoice: {
                        connect: {
                            id: data.documentRef
                        }
                    }
                });
                break;
        }

        const createdReceipt = await prisma.receipt.create({
            data: {
                type: "RECEIPT",
                date: data.date,
                movement: 'INFLOWS',
                amount: String(data.amount),
                amountType: data.amountType,
                paymentType: data.paymentMode,
                checkNumber: data.checkNumber,
                description: data.description,
                comment: data.comment,
                category: {
                    connect: {
                        id: data.category
                    }
                },
                nature: {
                    connect: {
                        id: data.nature
                    }
                },
                source: {
                    connect: {
                        id: data.source
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                ...referenceDocument,
            }
        });


        return NextResponse.json({
            status: "success",
            message: "L'encaissement crée avec succès.",
            data: createdReceipt,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de l'encaissement.",
        }, { status: 500 });
    }

}