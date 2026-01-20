import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { supplierSchema, SupplierSchemaType } from "@/lib/zod/supplier.schema";
import { NextResponse, type NextRequest } from "next/server";
import { createFile, createFolder, removePath } from "@/lib/file";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import { $Enums } from "@/lib/generated/prisma";
import { checkAccessDeletion } from "@/lib/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess("SUPPLIERS", "READ");

  if (!result.authorized) {
    return NextResponse.json(
      {
        status: "error",
        message: result.message,
        data: [],
      },
      { status: 200 }
    );
  }

  const id = getIdFromUrl(req.url, 2) as string;

  if (!id) {
    return NextResponse.json(
      {
        status: "error",
        message: "Aucun fournisseur trouvé.",
      },
      { status: 404 }
    );
  }

  const searchParam = req.nextUrl.searchParams.get("search") as string;

  const MAX_TAKE = 200;
  const DEFAULT_TAKE = 50;

  const rawSkip = req.nextUrl.searchParams.get("skip");
  const rawTake = req.nextUrl.searchParams.get("take");

  let skip = 0;
  let take: number | undefined = DEFAULT_TAKE;

  if (rawTake) {
    const parsed = parseInt(rawTake, 10);

    if (parsed === -1) {
      take = undefined; // 🔥 récupérer tous les suppliers
      skip = 0; // Ignorer skip si on veut tout
    } else if (!Number.isNaN(parsed) && parsed > 0) {
      take = Math.min(parsed, MAX_TAKE);
      skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;
    }
  } else if (rawSkip) {
    skip = Math.max(0, parseInt(rawSkip, 10) || 0);
  }

  try {
    const companyExist = await prisma.company.findUnique({
      where: { id },
    });

    if (!companyExist) {
      return NextResponse.json(
        {
          status: "error",
          message: "Aucun élément trouvé pour cet identifiant.",
        },
        { status: 404 }
      );
    }

    const where: any = {
      companyId: id,
    };

    if (searchParam) {
      const searchTerms = searchParam.split(/\s+/).filter(Boolean);

      where.OR = searchTerms.flatMap((term: string) => [
        { companyName: { contains: term, mode: "insensitive" } },
        { firstname: { contains: term, mode: "insensitive" } },
        { lastname: { contains: term, mode: "insensitive" } },
      ]);
    }

    const [total, suppliers] = await prisma.$transaction([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        include: {
          company: true,
        },
        ...(take !== undefined && { skip, take }),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json(
      {
        state: "success",
        data: suppliers,
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET /api/suppliers:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Erreur lors de la récupération des fournisseurs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const result = await checkAccess("SUPPLIERS", "CREATE");

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

  const data = parseData<SupplierSchemaType>(supplierSchema, {
    ...rawData,
    uploadDocuments: files,
  }) as SupplierSchemaType

  const folder = createFolder([companyExist.companyName, "supplier", `${data.firstname}_${data.lastname}`])
  let savedPaths: string[] = [];

  try {
    for (const file of files) {
      const upload = await createFile(file, folder);
      savedPaths = [...savedPaths, upload]
    }

    const createdSupplier = await prisma.supplier.create({
      data: {
        companyName: data.companyName,
        lastname: data.lastname,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        path: folder,
        website: data.website,
        job: data.job,
        capital: data.capital,
        legalForms: data.legalForms,
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
            id
          }
        }
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Fournisseur ajouté avec succès.",
      data: createdSupplier,
    });

  } catch (error) {
    await removePath(savedPaths)
    console.log({ error })

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de l'ajout du fournisseur.",
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("SUPPLIERS", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      company: true,
      receipts: true,
      dibursements: true,
      contracts: true,
      purchaseOrders: true
    }
  });

  if (!supplier) {
    return NextResponse.json({
      message: "Fournisseur introuvable.",
      state: "error",
    }, { status: 400 })
  }


  const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.SUPPLIERS, [id], supplier.company.id)

  if (hasAccessDeletion) {
    return NextResponse.json({
      state: "success",
      message: "Suppression en attente de validation.",
    }, { status: 200 })
  }

  if (
    supplier.receipts.length > 0 ||
    supplier.dibursements.length > 0 ||
    supplier.contracts.length > 0
  ) {
    return NextResponse.json({
      state: "error",
      message: "Supprimez d'abord les transactions, bon de commandes et contrats associés à ce fournisseur.",
    }, { status: 409 });
  }

  await prisma.supplier.delete({ where: { id } });
  await removePath(supplier.uploadDocuments);
  return NextResponse.json({
    state: "success",
    message: "Fournisseur supprimé avec succès.",
  }, { status: 200 }
  )
}