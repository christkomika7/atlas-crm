import { checkAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { dibursementSchema, DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");

    const res = await req.json();

    const data = parseData<DibursementSchemaType>(dibursementSchema, {
        ...res,
        date: new Date(res.date)
    }) as DibursementSchemaType;

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

        const createdDibursement = await prisma.dibursement.create({
            data: {
                type: "DISBURSEMENT",
                date: data.date,
                movement: 'OUTFLOWS',
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
                source: {
                    connect: {
                        id: data.source
                    }
                },
                nature: {
                    connect: {
                        id: data.nature
                    }
                },
                allocation: {
                    connect: {
                        id: data.allocation
                    }
                },

                payOnBehalfOf: {
                    connect: {
                        id: data.payOnBehalfOf
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
            message: "Le décaissement crée avec succès.",
            data: createdDibursement,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de décaissement.",
        }, { status: 500 });
    }

}