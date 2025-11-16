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
  await checkAccess(["CLIENTS"], "READ");
  const id = getIdFromUrl(req.url, "last") as string;
  const filter = req.nextUrl.searchParams.get("filter")?.trim() ?? "";

  const companyExist = await prisma.company.findUnique({ where: { id } });
  if (!companyExist) {
    return NextResponse.json({
      status: "error",
      message: "Aucun élément trouvé pour cet identifiant.",
    }, { status: 404 });
  }

  console.log({ filter })

  if (!filter) {
    const clients = await prisma.client.findMany({
      where: {
        companyId: id
      },
      include: {
        company: true
      }
    })

    return NextResponse.json({
      state: "success",
      data: clients,
    }, { status: 200 })
  }

  const clients = await prisma.client.findMany({
    where: {
      companyId: id,
      invoices: {
        some: {
          items: {
            some: {
              itemType: "billboard"
            }
          }
        }
      }
    },
    include: { company: true }
  });

  console.log({ clients })

  return NextResponse.json({
    state: "success",
    data: clients,
  }, { status: 200 });

}

export async function POST(req: NextRequest) {
  await checkAccess(["CLIENTS"], "CREATE");
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

  const data = parseData<ClientSchemaType>(clientSchema, {
    ...rawData,
    uploadDocuments: files,
  }) as ClientSchemaType

  const folder = createFolder([companyExist.companyName, "client", `${data.firstname}_${data.lastname}`])
  let savedPaths: string[] = [];

  try {
    for (const file of files) {
      const upload = await createFile(file, folder);
      savedPaths = [...savedPaths, upload]
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
      message: "Client ajouté avec succès.",
      data: createdClient,
    });

  } catch (error) {
    await removePath(savedPaths)
    console.log({ error })

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de l'ajout du client.",
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await checkAccess(["CLIENTS"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { company: true }
  });

  if (!client) {
    return NextResponse.json({
      message: "Client introuvable.",
      state: "error",
    }, { status: 400 })
  }

  const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.CLIENTS, [id], client.company.id);

  if (hasAccessDeletion) {
    return NextResponse.json({
      state: "success",
      message: "Suppression en attente de validation.",
    }, { status: 200 })
  }

  await prisma.client.delete({ where: { id } });
  await removePath(client.uploadDocuments);
  return NextResponse.json({
    state: "success",
    message: "Client supprimé avec succès.",
  }, { status: 200 }
  )
}