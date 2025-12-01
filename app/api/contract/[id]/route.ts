import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { checkAccessDeletion } from "@/lib/server";
import { $Enums } from "@/lib/generated/prisma";
import { clientContractSchema, ClientContractSchemaType, lessorContractSchema, LessorContractSchemaType } from "@/lib/zod/contract.schema";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export async function GET(req: NextRequest) {
  try {
    const result = await checkAccess("CONTRACT", "READ");

    if (!result.authorized) {
      return Response.json({
        status: "error",
        message: result.message,
        data: []
      }, { status: 200 });
    }


    const companyId = getIdFromUrl(req.url, "last") as string;
    if (!companyId) {
      return NextResponse.json(
        { status: "error", message: "Identifiant de company invalide." },
        { status: 400 }
      );
    }

    const exist = await prisma.company.findUnique({ where: { id: companyId } });
    if (!exist) {
      return NextResponse.json(
        { status: "error", message: "Aucun élément trouvé pour cet identifiant." },
        { status: 404 }
      );
    }

    const typeParam = req.nextUrl.searchParams.get("type")?.trim();
    const type = typeParam as unknown as $Enums.ContractType;
    if (!typeParam) {
      return NextResponse.json(
        { status: "error", message: "Aucun filtre trouvé." },
        { status: 400 }
      );
    }

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;
    const take = rawTake ? Math.max(1, parseInt(rawTake, 10) || DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

    const total = await prisma.contract.count({
      where: {
        companyId,
        type,
      },
    });

    const contracts = await prisma.contract.findMany({
      where: {
        companyId,
        type,
      },
      include: {
        client: true,
        lessor: true,
        invoices: {
          include: {
            project: true
          }
        },
        company: {
          include: {
            documentModel: true
          }
        },
        billboard: {
          include: {
            lessorSupplier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    return NextResponse.json(
      {
        status: "success",
        data: contracts,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/contract/:companyId :", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la récupération des contrats.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const result = await checkAccess("CONTRACT", "CREATE");
  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;
  const companyExist = await prisma.company.findUnique({ where: { id } });

  if (!companyExist) {
    return NextResponse.json({
      status: "error",
      message: "Aucun élément trouvé pour cet identifiant.",
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
      }) as ClientContractSchemaType;

      try {
        const createdContract = await prisma.contract.create({
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
              connect: data.invoices.map(id => ({ id }))
            }
          }
        });

        return NextResponse.json({
          status: "success",
          message: "Contrat ajouté avec succès.",
          data: createdContract,
        });
      } catch (error) {
        console.error("Erreur création contrat:", error);
        return NextResponse.json({
          status: "error",
          message: "Erreur lors de la création du contrat.",
        }, { status: 500 });
      }

    case "LESSOR":
      const lessorData = parseData<LessorContractSchemaType>(lessorContractSchema, {
        ...jsonData,
      }) as LessorContractSchemaType;

      try {
        const createdContract = await prisma.contract.create({
          data: {
            type: lessorData.type,
            lessorType: lessorData.lesortType,
            ...lessorData.lessor && lessorData.lesortType === 'supplier' ? {
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
          message: "Contrat ajouté avec succès.",
          data: createdContract,
        });
      } catch (error) {
        console.error("Erreur création contrat:", error);
        return NextResponse.json({
          status: "error",
          message: "Erreur lors de la création du contrat.",
        }, { status: 500 });
      }
  }
}

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("CONTRACT", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }


  const id = getIdFromUrl(req.url, "last") as string;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { company: true }
  });

  if (!contract) {
    return NextResponse.json({
      message: "Contrat introuvable.",
      state: "error",
    }, { status: 400 })
  }

  const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.CONTRACT, [id], contract.company.id);

  if (hasAccessDeletion) {
    return NextResponse.json({
      state: "success",
      message: "Suppression en attente de validation.",
    }, { status: 200 })
  }

  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({
    state: "success",
    message: "Contrat supprimé avec succès.",
  }, { status: 200 }
  )
}