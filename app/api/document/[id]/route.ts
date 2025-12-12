import { checkAccess, sessionAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { documentSchema, DocumentSchemaType } from "@/lib/zod/document.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess(
    ["SETTING", "INVOICES", "QUOTES", "PURCHASE_ORDER", "DELIVERY_NOTES"],
    "READ",
  );

  if (!result.authorized) {
    return Response.json(
      {
        state: "error",
        message: result.message,
      },
      { status: 403 },
    );
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const document = await prisma.documentModel.findUnique({
    where: { companyId: id },
    include: { company: true },
  });

  return NextResponse.json(
    {
      state: "success",
      data: document,
      message: "",
    },
    { status: 200 },
  );
}

export async function PUT(req: NextRequest) {
  const { hasSession, userId } = await sessionAccess();

  if (!hasSession || !userId) {
    return Response.json(
      {
        status: "error",
        message: "Aucune session trouvée",
        data: [],
      },
      { status: 200 },
    );
  }

  const id = getIdFromUrl(req.url, "last") as string;
  const formData = await req.formData();

  const logo = formData.get("logo") as File | undefined;

  const data: DocumentSchemaType = {
    companyId: formData.get("company")?.toString() || "",
    quotes: {
      prefix: formData.get("quotesPrefix")?.toString() || undefined,
      notes: formData.get("quotesInfo")?.toString() || undefined,
    },
    invoices: {
      prefix: formData.get("invoicesPrefix")?.toString() || undefined,
      notes: formData.get("invoicesInfo")?.toString() || undefined,
    },
    deliveryNotes: {
      prefix: formData.get("deliveryNotesPrefix")?.toString() || undefined,
      notes: formData.get("deliveryNotesInfo")?.toString() || undefined,
    },
    purchaseOrders: {
      prefix: formData.get("purchaseOrdersPrefix")?.toString() || undefined,
      notes: formData.get("purchaseOrdersInfo")?.toString() || undefined,
    },
    primaryColor: formData.get("primaryColor") as string,
    secondaryColor: formData.get("secondaryColor") as string,
    position: formData.get("position")?.toString() || undefined,
    size: formData.get("size")?.toString() || undefined,
    logo: logo ? logo : undefined
  };

  const [companyExist, documentExist] = await prisma.$transaction([
    prisma.company.findUnique({ where: { id: data.companyId } }),
    prisma.documentModel.findUnique({ where: { id } }),
  ]);
  if (!companyExist || !documentExist) {
    return NextResponse.json(
      {
        status: "error",
        message: "Aucun élément trouvé pour cet identifiant.",
      },
      { status: 404 },
    );
  }

  const parsedData = parseData<DocumentSchemaType>(
    documentSchema,
    data,
  ) as DocumentSchemaType;


  const folder = createFolder([companyExist.companyName, "logo"]);
  let savedPath = "";

  await removePath(documentExist.logo);

  try {
    savedPath = await createFile(parsedData.logo, folder, "logo");
    const updateDocument = await prisma.documentModel.update({
      where: { id },
      data: {
        logo: savedPath,
        position: parsedData.position ?? "",
        size: parsedData.size ?? "",
        primaryColor: parsedData.primaryColor,
        secondaryColor: parsedData.secondaryColor,

        quotesPrefix: parsedData.quotes?.prefix ?? "",
        quotesInfo: parsedData.quotes?.notes ?? "",

        invoicesPrefix: parsedData.invoices?.prefix ?? "",
        invoicesInfo: parsedData.invoices?.notes ?? "",

        deliveryNotesPrefix: parsedData.deliveryNotes?.prefix ?? "",
        deliveryNotesInfo: parsedData.deliveryNotes?.notes ?? "",

        purchaseOrderPrefix: parsedData.purchaseOrders?.prefix ?? "",
        purchaseOrderInfo: parsedData.purchaseOrders?.notes ?? "",

        company: {
          connect: {
            id: data.companyId,
          },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Document modifié avec succès.",
      data: updateDocument,
    });
  } catch (error) {
    await removePath(savedPath);
    console.log({ error });

    return NextResponse.json(
      {
        status: "error",
        message: "Erreur lors de la modification du modèle de document.",
      },
      { status: 500 },
    );
  }
}
