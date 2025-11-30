import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { $Enums } from "@/lib/generated/prisma";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { clientContractSchema, ClientContractSchemaType, lessorContractSchema, LessorContractSchemaType } from "@/lib/zod/contract.schema";

export async function PUT(req: NextRequest) {
    const result = await checkAccess("CONTRACT", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }


    const jsonData = await req.json();

    const type = jsonData.type as $Enums.ContractType;

    if (!type) {
        return NextResponse.json({
            status: "error",
            message: "Aucun type de contrat trouvé.",
        }, { status: 400 });
    }

    switch (type) {
        case "CLIENT":
            const data = parseData<ClientContractSchemaType>(clientContractSchema, {
                ...jsonData,
            }) as ClientContractSchemaType

            try {
                const updatedContract = await prisma.contract.update({
                    where: { id },
                    data: {
                        type: data.type,
                        client: {
                            connect: {
                                id: data.client
                            }
                        },
                        company: {
                            connect: {
                                id: data.company
                            }
                        },
                        invoices: {
                            set: data.invoices.map(id => ({ id }))
                        }
                    }
                });

                return NextResponse.json({
                    status: "success",
                    message: "Contrat modifié avec succès.",
                    data: updatedContract,
                });

            } catch {
                return NextResponse.json({
                    status: "error",
                    message: "Erreur lors de la modification du contrat.",
                }, { status: 500 });
            }

        case "LESSOR":
            const lessorData = parseData<LessorContractSchemaType>(lessorContractSchema, {
                ...jsonData,
            }) as LessorContractSchemaType

            try {
                const createdContract = await prisma.contract.update({
                    where: { id },
                    data: {
                        type: lessorData.type,
                        lessorType: lessorData.lesortType,
                        ...lessorData.lessor ? {
                            lessor: {
                                connect: {
                                    id: lessorData.lessor
                                }
                            }
                        } : {},
                        company: {
                            connect: {
                                id: lessorData.company
                            }
                        },
                        billboard: {
                            connect: {
                                id: lessorData.billboard
                            }
                        }
                    }
                });

                return NextResponse.json({
                    status: "success",
                    message: "Contrat modifié avec succès.",
                    data: createdContract,
                });

            } catch {
                return NextResponse.json({
                    status: "error",
                    message: "Erreur lors de la modification du contrat.",
                }, { status: 500 });
            }
    }
}
