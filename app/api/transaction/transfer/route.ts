import { checkAccess, sessionAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { transferSchema, TransferSchemaType } from "@/lib/zod/transfert.schema";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE"]);
    const { isAdmin, userId } = await sessionAccess();
    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId as string } })

    if (!user) return NextResponse.json({
        state: "error",
        message: "Utlisateur non trouvé."
    }, { status: 400 });

    const res = await req.json();
    const data = parseData<TransferSchemaType>(transferSchema, {
        ...res,
        date: new Date(res.date)
    }) as TransferSchemaType;

    const companyExist = await prisma.company.findUnique({
        where: { id: data.companyId }
    });

    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide",
        }, { status: 404 });
    }

    try {
        const originSource = await prisma.source.findUnique({
            where: { id: data.origin }
        });

        const destinationSource = await prisma.source.findUnique({
            where: { id: data.destination }
        });

        if (!originSource || !destinationSource) {
            return NextResponse.json({
                status: "error",
                message: "Source d'origine ou de destination introuvable.",
            }, { status: 404 });
        }

        const receiptsOrigin = await prisma.receipt.aggregate({
            where: {
                sourceId: data.origin,
                companyId: data.companyId
            },
            _sum: {
                amount: true
            }
        });

        const disbursementsOrigin = await prisma.dibursement.aggregate({
            where: {
                sourceId: data.origin,
                companyId: data.companyId
            },
            _sum: {
                amount: true
            }
        });

        const totalReceipts = new Decimal(receiptsOrigin._sum.amount?.toString() || "0");
        const totalDisbursements = new Decimal(disbursementsOrigin._sum.amount?.toString() || "0");
        const availableBalance = totalReceipts.minus(totalDisbursements);

        const transferAmount = new Decimal(data.amount);
        if (transferAmount.greaterThan(availableBalance)) {
            return NextResponse.json({
                status: "error",
                message: `Solde insuffisant. Disponible: ${availableBalance.toFixed(2)}, Demandé: ${transferAmount.toFixed(2)}`,
            }, { status: 400 });
        }

        let category = await prisma.transactionCategory.findFirst({
            where: {
                companyId: data.companyId,
                name: "Transfert CaC",
                type: "RECEIPT"
            }
        });

        if (!category) {
            category = await prisma.transactionCategory.create({
                data: {
                    type: "RECEIPT",
                    name: "Transfert CaC",
                    company: {
                        connect: { id: data.companyId }
                    }
                }
            });
        }

        let receiptNature = await prisma.transactionNature.findFirst({
            where: {
                categoryId: category.id,
                name: `Par ${originSource.name}`
            }
        });

        if (!receiptNature) {
            receiptNature = await prisma.transactionNature.create({
                data: {
                    name: `Par ${originSource.name}`,
                    category: {
                        connect: { id: category.id }
                    },
                    company: {
                        connect: { id: data.companyId }
                    }
                }
            });
        }

        let disbursementNature = await prisma.transactionNature.findFirst({
            where: {
                categoryId: category.id,
                name: `Pour ${destinationSource.name}`
            }
        });

        if (!disbursementNature) {
            disbursementNature = await prisma.transactionNature.create({
                data: {
                    name: `Pour ${destinationSource.name}`,
                    category: {
                        connect: { id: category.id }
                    },
                    company: {
                        connect: { id: data.companyId }
                    }
                }
            });
        }


        const [sourceA, sourceB] = await prisma.$transaction([
            prisma.source.findUnique({ where: { id: data.origin } }),
            prisma.source.findUnique({ where: { id: data.destination } }),
        ]);

        if (!isAdmin) {
            const newDibursement = await prisma.dibursementData.create({
                data: {
                    date: data.date,
                    amount: data.amount,
                    infos: data.information,
                    category: category.id,
                    nature: JSON.stringify([disbursementNature.id, receiptNature.id]),
                    source: JSON.stringify([data.origin, data.destination]),
                    amountType: "HT",
                    paymentType: "withdrawal"
                }
            });

            await prisma.notification.create({
                data: {
                    type: 'CONFIRM',
                    for: 'TRANSFER',
                    message: `${user.name} a lancé un transfert en attente de validation de ${formatNumber(data.amount)} ${companyExist.currency} du compte ${sourceA?.name} vers le compte ${sourceB?.name}.
                    \nCommentaire : \n
                    ${data.information}
                    `,
                    dibursement: {
                        connect: { id: newDibursement.id }
                    },
                    company: {
                        connect: { id: data.companyId }
                    }
                }
            });

            return NextResponse.json({
                status: "success",
                message: "Votre requête est en attente de validation.",
            });
        }

        const createdDisbursement = await prisma.dibursement.create({
            data: {
                type: "DISBURSEMENT",
                date: data.date,
                movement: 'OUTFLOWS',
                amount: data.amount,
                amountType: "HT",
                paymentType: "withdrawal",
                infos: data.information || `Transfert vers ${destinationSource.name}`,
                category: {
                    connect: { id: category.id }
                },
                nature: {
                    connect: { id: disbursementNature.id }
                },
                source: {
                    connect: { id: data.origin }
                },
                company: {
                    connect: { id: data.companyId }
                }
            }
        });

        const createdReceipt = await prisma.receipt.create({
            data: {
                type: "RECEIPT",
                date: data.date,
                movement: 'INFLOWS',
                amount: data.amount,
                amountType: "HT",
                paymentType: "withdrawal",
                infos: data.information || `Transfert depuis ${originSource.name}`,
                category: {
                    connect: { id: category.id }
                },
                nature: {
                    connect: { id: receiptNature.id }
                },
                source: {
                    connect: { id: data.destination }
                },
                company: {
                    connect: { id: data.companyId }
                }
            }
        });

        await prisma.notification.create({
            data: {
                type: 'ALERT',
                for: 'TRANSFER',
                message: `${user.name} a réalisé un transfert  de ${formatNumber(data.amount)} ${companyExist.currency} du compte ${sourceA?.name} vers le compte ${sourceB?.name}.
                \nCommentaire : \n
                ${data.information}
                `,
                company: {
                    connect: { id: data.companyId }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: `Transfert effectué avec succès de ${originSource.name} vers ${destinationSource.name}.`,
            data: {
                receipt: createdReceipt,
                disbursement: createdDisbursement,
                amount: data.amount,
                from: originSource.name,
                to: destinationSource.name
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: "error",
            message: "Erreur lors du transfert.",
        }, { status: 500 });
    }
}