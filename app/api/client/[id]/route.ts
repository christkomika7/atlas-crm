import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { clientSchema, ClientSchemaType } from "@/lib/zod/client.schema";
import { NextResponse, type NextRequest } from "next/server";
import { createFile, createFolder, removePath } from "@/lib/file";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { checkAccessDeletion } from "@/lib/server";
import { $Enums } from "@/lib/generated/prisma";


export async function GET(req: NextRequest) {
  const result = await checkAccess("CLIENTS", "READ");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, 2) as string;

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun client trouvé.",
    }, { status: 404 });
  }

  const filterParam = req.nextUrl.searchParams.get("filter") ?? undefined;
  const searchParam = req.nextUrl.searchParams.get("search") as string;

  const MAX_TAKE = 200;
  const DEFAULT_TAKE = 50;

  const rawSkip = req.nextUrl.searchParams.get("skip");
  const rawTake = req.nextUrl.searchParams.get("take");

  const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

  let take = DEFAULT_TAKE;
  if (rawTake) {
    const parsed = parseInt(rawTake, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      take = Math.min(parsed, MAX_TAKE);
    }
  }

  try {
    const companyExist = await prisma.company.findUnique({ where: { id } });
    if (!companyExist) {
      return NextResponse.json({
        status: "error",
        message: "Aucun élément trouvé pour cet identifiant.",
      }, { status: 404 });
    }

    let where: any = { companyId: id };

    if (searchParam) {
      const searchTerms = searchParam.split(/\s+/).filter(Boolean);

      where.OR = searchTerms.flatMap((term: string) => [
        { companyName: { contains: term, mode: "insensitive" } },
        { firstname: { contains: term, mode: "insensitive" } },
        { lastname: { contains: term, mode: "insensitive" } },
      ]);
    }

    if (filterParam === "billboard") {
      where.invoices = {
        some: {
          items: {
            some: {
              itemType: "billboard",
            },
          },
        },
      };
    }

    const [total, clients] = await prisma.$transaction([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        include: {
          company: true,
        },
        skip,
        take,
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json(
      {
        state: "success",
        data: clients,
        total
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erreur GET /api/clients:", error);
    return NextResponse.json(
      { status: "error", message: "Erreur lors de la récupération des clients." },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  const result = await checkAccess("CLIENTS", "CREATE");

  if (!result.authorized) {
    return Response.json(
      {
        status: "error",
        message: result.message,
      },
      { status: 403 },
    );
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const companyExist = await prisma.company.findUnique({ where: { id } });
  if (!companyExist) {
    return NextResponse.json(
      {
        status: "error",
        message: "Aucun élément trouvé pour cet identifiant.",
      },
      { status: 404 },
    );
  }

  const formData = await req.formData();
  const rawData: any = {};
  const files: File[] = [];

  formData.forEach((value, key) => {
    if (key === "uploadDocuments" && value instanceof File) {
      files.push(value);
    } else {
      rawData[key] = value as string;
    }
  });

  const data = parseData<ClientSchemaType>(clientSchema, {
    ...rawData,
    uploadDocuments: files,
  }) as ClientSchemaType;

  const folder = createFolder([
    companyExist.companyName,
    "client",
    `${data.firstname}_${data.lastname}`,
  ]);
  let savedPaths: string[] = [];

  try {
    for (const file of files) {
      const upload = await createFile(file, folder);
      savedPaths = [...savedPaths, upload];
    }

    const createdClient = await prisma.client.create({
      data: {
        companyName: data.companyName,
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        path: folder,
        job: data.job,
        legalForms: data.legalForms,
        capital: data.capital,
        website: data.website,
        address: data.address,
        businessSector: data.businessSector,
        businessRegistrationNumber: data.businessRegistrationNumber,
        taxIdentificationNumber: data.taxIdentificationNumber,
        discount: data.discount,
        paymentTerms: data.paymentTerms,
        information: data.information,
        uploadDocuments: savedPaths,
        company: {
          connect: {
            id,
          },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Client ajouté avec succès.",
      data: createdClient,
    });
  } catch (error) {
    await removePath(savedPaths);
    console.log({ error });

    return NextResponse.json(
      {
        status: "error",
        message: "Erreur lors de l'ajout du client.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("CLIENTS", "MODIFY");

  if (!result.authorized) {
    return Response.json(
      {
        status: "error",
        message: result.message,
      },
      { status: 403 },
    );
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      company: true,
      invoices: true,
      projects: true,
      receipts: true,
      dibursements: true,
      contracts: true,
      deliveryNotes: true,
      quotes: true,
      appointments: true,
    },
  });

  if (!client) {
    return NextResponse.json(
      {
        message: "Client introuvable.",
        state: "error",
      },
      { status: 400 },
    );
  }

  const hasAccessDeletion = await checkAccessDeletion(
    $Enums.DeletionType.CLIENTS,
    [id],
    client.company.id,
  );

  if (hasAccessDeletion) {
    return NextResponse.json(
      {
        state: "success",
        message: "Suppression en attente de validation.",
      },
      { status: 200 },
    );
  }

  if (
    client.invoices.length > 0 ||
    client.projects.length > 0 ||
    client.receipts.length > 0 ||
    client.dibursements.length > 0 ||
    client.contracts.length > 0 ||
    client.quotes.length > 0 ||
    client.deliveryNotes.length > 0 ||
    client.appointments.length > 0
  ) {
    return NextResponse.json({
      state: "error",
      message: "Supprimez d'abord les transactions, factures, devis, bon de livraisons, contrats, projets et rendez-vous associés à ce client.",
    }, { status: 409 });
  }

  await prisma.client.delete({ where: { id } });
  await removePath(client.uploadDocuments);
  return NextResponse.json(
    {
      state: "success",
      message: "Client supprimé avec succès.",
    },
    { status: 200 },
  );
}
