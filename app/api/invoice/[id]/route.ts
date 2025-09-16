import { checkAccess } from "@/lib/access";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { invoiceUpdateSchema, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await checkAccess(["INVOICES"], "READ");
  const companyId = getIdFromUrl(req.url, "last") as string;

  const lastInvoice = await prisma.invoice.findFirst({
    where: { companyId },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  return NextResponse.json({
    state: "success",
    data: lastInvoice ? lastInvoice.invoiceNumber + 1 : 1,
  }, { status: 200 })
}

export async function POST(req: NextRequest) {
  await checkAccess(["INVOICES"], "READ");
  const id = getIdFromUrl(req.url, "last") as string;
  const { data }: { data: "unpaid" | "paid" } = await req.json();

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: id,
      isPaid: data === "paid" ? true : false,
    },
    include: {
      client: true,
      project: true,
      items: true,
    },
  });

  return NextResponse.json(
    {
      state: "success",
      data: invoices,
    },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  await checkAccess(["INVOICES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const formData = await req.formData();
  const rawData: any = {};
  const files: File[] = [];
  const photos: File[] = [];

  formData.forEach((value, key) => {
    if (key === "files" && value instanceof File) {
      files.push(value);
    } else if (key === "photos" && value instanceof File) {
      photos.push(value);
    } else {
      rawData[key] = value as string;
    }
  });

  const data = parseData<InvoiceUpdateSchemaType>(invoiceUpdateSchema, {
    ...rawData,
    item: {
      productServices: JSON.parse(rawData.productServices),
      billboards: JSON.parse(rawData.billboards),
    },
    lastUploadFiles: JSON.parse(rawData.lastUploadFiles),
    lastUploadPhotos: JSON.parse(rawData.lastUploadPhotos),
    files,
    photos,
    invoiceNumber: parseInt(rawData.invoiceNumber),
  }) as InvoiceUpdateSchemaType;

  const [invoiceExist, companyExist, clientExist, projectExist,] =
    await prisma.$transaction([
      prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
      prisma.company.findUnique({ where: { id: data.companyId } }),
      prisma.client.findUnique({ where: { id: data.clientId } }),
      prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);

  if (!invoiceExist) {
    return NextResponse.json(
      { status: "error", message: "L'identifiant de la facture est invalide." },
      { status: 404 }
    );
  }
  if (!companyExist) {
    return NextResponse.json(
      { status: "error", message: "L'identifiant de l'entreprise est introuvable." },
      { status: 404 }
    );
  }
  if (!clientExist) {
    return NextResponse.json(
      { status: "error", message: "L'identifiant du client est introuvable." },
      { status: 404 }
    );
  }
  if (!projectExist) {
    return NextResponse.json(
      { status: "error", message: "L'identifiant du projet est introuvable." },
      { status: 404 }
    );
  }

  const key = invoiceExist.pathFiles.split("/")[2].split("_----")[1];
  const invoiceNumber = invoiceExist.pathFiles.split("/")[2].split("_----")[0];

  const folderPhoto = createFolder([
    companyExist.companyName,
    "invoice",
    `${invoiceNumber}_----${key}/photos`,
  ]);
  const folderFile = createFolder([
    companyExist.companyName,
    "invoice",
    `${invoiceNumber}_----${key}/files`,
  ]);

  let savedFilePaths = await updateFiles({
    folder: folderFile,
    outdatedData: {
      id: invoiceExist.id,
      path: invoiceExist.pathFiles,
      files: invoiceExist.files,
    },
    updatedData: {
      id: data.id,
      lastUploadDocuments: data.lastUploadFiles,
    },
    files,
  });

  let savedPhotoPaths = await updateFiles({
    folder: folderPhoto,
    outdatedData: {
      id: invoiceExist.id,
      path: invoiceExist.pathPhotos,
      files: invoiceExist.photos,
    },
    updatedData: {
      id: data.id,
      lastUploadDocuments: data.lastUploadPhotos,
    },
    files: photos,
  });

  try {
    // IDs envoyés depuis le client
    const billboardIds =
      data.item.billboards?.map((b) => b.billboardId).filter(Boolean) || [];
    const productServiceIds =
      data.item.productServices?.map((p) => p.productServiceId).filter(Boolean) ||
      [];

    // Items déjà en DB
    const existingItemIds = invoiceExist.items.map((i) => i.id);

    // IDs qui doivent rester
    const keptItemIds = [...billboardIds, ...productServiceIds];

    // Déterminer les nouveaux et supprimés
    const deletedItemIds = existingItemIds.filter(
      (id) => !keptItemIds.includes(id)
    );
    const newBillboardItems = data.item.billboards?.filter(
      (b) => b.billboardId && !existingItemIds.includes(b.billboardId)
    );
    const newProductServiceItems = data.item.productServices?.filter(
      (p) => p.productServiceId && !existingItemIds.includes(p.productServiceId)
    );


    // Mise à jour de la facture et relations`
    const [updatedInvoice] = await prisma.$transaction([
      prisma.invoice.update({
        where: { id },
        data: {
          totalHT: data.totalHT,
          discount: data.discount!,
          discountType: data.discountType,
          pathFiles: folderFile,
          pathPhotos: folderPhoto,
          totalTTC: data.totalTTC,
          payee: data.payee!,
          note: data.note!,
          photos: savedPhotoPaths,
          files: savedFilePaths,
          // items: {
          //   disconnect: deletedItemIds.map((id) => ({ id })),
          //   create: [
          //     ...(newBillboardItems?.map((billboard) => ({
          //       name: billboard.name,
          //       description: billboard.description ?? "",
          //       quantity: billboard.quantity,
          //       price: billboard.price,
          //       discount: billboard.discount!,
          //       discountType: billboard.discountType as string,
          //       currency: billboard.currency!,
          //       billboardId: billboard.billboardId,
          //       itemType: billboard.itemType ?? "billboard"
          //     })) || []),
          //     ...(newProductServiceItems?.map((productService) => ({
          //       name: productService.name,
          //       description: productService.description ?? "",
          //       quantity: productService.quantity,
          //       price: productService.price,
          //       discount: productService.discount!,
          //       discountType: productService.discountType as string,
          //       currency: productService.currency!,
          //       productServiceId: productService.productServiceId,
          //       itemType: productService.itemType ?? "product"
          //     })) || []),
          //   ],
          //   update: [
          //     ...(data.item.billboards?.map((billboard) => ({
          //       where: { id: billboard.billboardId }, // doit exister
          //       data: {
          //         name: billboard.name,
          //         description: billboard.description ?? "",
          //         quantity: billboard.quantity,
          //         price: billboard.price,
          //         discount: billboard.discount!,
          //         discountType: billboard.discountType as string,
          //         currency: billboard.currency!,
          //         itemType: billboard.itemType ?? "billboard",
          //       },
          //     })) || []),

          //     ...(data.item.productServices?.map((productService) => ({
          //       where: { id: productService.productServiceId }, // doit exister
          //       data: {
          //         name: productService.name,
          //         description: productService.description ?? "",
          //         quantity: productService.quantity,
          //         price: productService.price,
          //         discount: productService.discount!,
          //         discountType: productService.discountType as string,
          //         currency: productService.currency!,
          //         itemType: productService.itemType ?? "product",
          //       },
          //     })) || []),
          //   ],
          // },

          project: { connect: { id: data.projectId } },
          client: { connect: { id: data.clientId } },
          company: { connect: { id: data.companyId } },
        },
      }),

      prisma.item.deleteMany({
        where: { id: { in: deletedItemIds } },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      message: "Facture modifiée avec succès.",
      data: updatedInvoice,
    });
  } catch (error) {
    await removePath([...savedFilePaths, ...savedPhotoPaths]);
    console.log({ error });

    return NextResponse.json(
      {
        status: "error",
        message: "Erreur lors de la modification de la facture.",
      },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  await checkAccess(["INVOICES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    return NextResponse.json({
      message: "Facture introuvable.",
      state: "error",
    }, { status: 400 })
  }

  await prisma.invoice.delete({ where: { id } });
  await removePath([...invoice.pathFiles, ...invoice.pathPhotos]);
  return NextResponse.json({
    state: "success",
    message: "Facture supprimée avec succès.",
  }, { status: 200 }
  )
}

