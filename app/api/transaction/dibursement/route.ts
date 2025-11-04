import { DIBURSMENT_CATEGORY } from "@/config/constant";
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
        date: new Date(res.date),
        period: res.period ? {
            from: new Date(res.period.from),
            to: new Date(res.period.to),
        } : undefined
    }) as DibursementSchemaType;

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) return NextResponse.json({
        status: "error",
        message: "Identifiant invalide",
    }, { status: 404 })

    const category = await prisma.transactionCategory.findUnique({ where: { id: data.category } });

    if (!category) {
        return NextResponse.json({
            status: "error",
            message: "Catégorie invalide",
        }, { status: 404 })
    }

    if (DIBURSMENT_CATEGORY.includes(category.name) && !data.allocation) {
        return NextResponse.json({
            status: "error",
            message: "L'allocation est obligatoire pour le règlement fournisseur",
        }, { status: 404 })
    }

    try {

        const referenceDocument = {};

        if (data.allocation) {
            Object.assign(referenceDocument, {
                allocation: {
                    connect: {
                        id: data.allocation
                    }
                },
            })
        }

        if (data.period) {
            Object.assign(referenceDocument, {
                periodStart: data.period.from,
                periodEnd: data.period.to
            })
        }

        if (data.documentRef) {
            Object.assign(referenceDocument, {
                referencePurchaseOrder: {
                    connect: {
                        id: data.documentRef
                    }
                },
            })
        }

        if (data.project) {
            Object.assign(referenceDocument, {
                project: {
                    connect: {
                        id: data.project
                    }
                }
            });
        }

        if (data.payOnBehalfOf) {
            Object.assign(referenceDocument, {
                payOnBehalfOf: {
                    connect: {
                        id: data.payOnBehalfOf
                    }
                },
            });
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