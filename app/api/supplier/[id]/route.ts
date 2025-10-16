import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { supplierSchema, SupplierSchemaType } from "@/lib/zod/supplier.schema";
import { NextResponse, type NextRequest } from "next/server";
import { createFile, createFolder, removePath } from "@/lib/file";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";

export async function GET(req: NextRequest) {
  await checkAccess(["SUPPLIERS"], "READ");
  const id = getIdFromUrl(req.url, "last") as string;

  const companyExist = await prisma.company.findUnique({ where: { id } });
  if (!companyExist) {
    return NextResponse.json({
      status: "error",
      message: "Aucun élément trouvé pour cet identifiant.",
    }, { status: 404 });
  }

  const suppliers = await prisma.supplier.findMany({
    where: {
      companyId: id
    },
    include: {
      company: true
    }
  })

  return NextResponse.json({
    state: "success",
    data: suppliers,
  }, { status: 200 })
}

export async function POST(req: NextRequest) {
  await checkAccess(["SUPPLIERS"], "CREATE");
  const id = getIdFromUrl(req.url, "last") as string;

  const companyExist = await prisma.company.findUnique({ where: { id } });
  if (!companyExist) {
    console.log({ error: "Identifiant invalide." })
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
  await checkAccess(["SUPPLIERS"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    return NextResponse.json({
      message: "Fournisseur introuvable.",
      state: "error",
    }, { status: 400 })
  }

  await prisma.supplier.delete({ where: { id } });
  await removePath(supplier.uploadDocuments);
  return NextResponse.json({
    state: "success",
    message: "Fournisseur supprimé avec succès.",
  }, { status: 200 }
  )
}