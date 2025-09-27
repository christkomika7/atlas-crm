import { checkAccess } from "@/lib/access";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkBillboardConflicts, rollbackInvoice } from "@/lib/server";
import { getIdFromUrl } from "@/lib/utils";
import { invoiceUpdateSchema, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { InvoiceType } from "@/types/invoice.types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await checkAccess(["INVOICES"], "READ");
  const companyId = getIdFromUrl(req.url, "last") as string;

  if (!companyId) {
    return NextResponse.json({
      state: "error",
      message: "Aucune facture trouvée.",
    }, { status: 404 });
  }

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

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucune facture trouvée.",
    }, { status: 404 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: id,
      isPaid: data === "paid" ? true : false,
    },
    include: {
      client: true,
      project: true,
      items: true,
      company: {
        include: {
          documentModel: true
        }
      }
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
  // 1. Contrôle d’accès et récupération de l’ID
  await checkAccess(["INVOICES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucune facture trouvée.",
    }, { status: 404 });
  }

  // 2. Récupération et parsing des données du formulaire
  const formData = await req.formData();
  const rawData: any = {};
  const files: File[] = [];

  formData.forEach((value, key) => {
    if (key === "files" && value instanceof File) {
      files.push(value)
    }
    else {
      rawData[key] = value as string;
    }
  });
  // On parse les listes JSON et on adapte les dates
  const productServicesParse = JSON.parse(rawData.productServices);
  const billboardsParse = JSON.parse(rawData.billboards);


  const data = parseData<InvoiceUpdateSchemaType>(invoiceUpdateSchema, {
    ...rawData,
    item: {
      productServices: productServicesParse,
      billboards: billboardsParse?.map((b: any) => ({
        id: b.id,
        name: b.name,
        quantity: b.quantity,
        locationStart: new Date(b.locationStart),
        locationEnd: new Date(b.locationEnd),
        status: b.status,
        price: b.price,
        updatedPrice: b.updatedPrice,
        currency: b.currency,
        discount: b.discount,
        discountType: b.discountType,
        itemType: b.itemType,
        billboardId: b.billboardId
      })) ?? []
    },
    lastUploadFiles: JSON.parse(rawData.lastUploadFiles || "[]"),
    files,
    invoiceNumber: parseInt(rawData.invoiceNumber)
  }) as InvoiceUpdateSchemaType;


  const [invoiceExist, companyExist, clientExist, projectExist] =
    await prisma.$transaction([
      prisma.invoice.findUnique({ where: { id }, include: { items: true, productsServices: true, billboards: true } }),
      prisma.company.findUnique({ where: { id: data.companyId } }),
      prisma.client.findUnique({ where: { id: data.clientId } }),
      prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);

  if (!invoiceExist) {
    return NextResponse.json(
      { status: "error", message: "Facture introuvable." },
      { status: 404 }
    );
  }

  if (!companyExist) {
    return NextResponse.json(
      { status: "error", message: "Entreprise introuvable." },
      { status: 404 }
    );
  }

  if (!clientExist) {
    return NextResponse.json(
      { status: "error", message: "Client introuvable." },
      { status: 404 }
    );
  }
  if (!projectExist) {
    return NextResponse.json(
      { status: "error", message: "Projet introuvable." },
      { status: 404 }
    );
  }

  const key = invoiceExist.pathFiles.split("/")[2].split("_----")[1];
  const invoiceNumber = invoiceExist.pathFiles.split("/")[2].split("_----")[0];

  const folderFile = createFolder([
    companyExist.companyName,
    "invoice",
    `${invoiceNumber}_----${key}/files`,
  ]);

  const billboards = data.item.billboards ?? [];
  const excludeBillboardIds = invoiceExist.items.filter(item => item.itemType === "billboard").map(item => item.id)

  const conflictResult = await checkBillboardConflicts(billboards, excludeBillboardIds);

  if (conflictResult.hasConflict) {
    return NextResponse.json({
      status: "error",
      message: "Conflit de dates détecté pour au moins un panneau.",
    }, { status: 404 });
  }

  if (Number(invoiceExist.payee) === 0 || !invoiceExist.isPaid) {
    await rollbackInvoice(invoiceExist as unknown as InvoiceType, data.companyId)
  }

  if (invoiceExist.isPaid) {
    return NextResponse.json(
      {
        status: "error",
        message: "La facture a déjà été réglée",
      },
      { status: 400 }
    );
  }

  console.log({ it: data.item.billboards })

  const savedFilePaths = await updateFiles({
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

  try {
    const [updatedInvoice] = await prisma.$transaction([
      prisma.client.update({
        where: { id: invoiceExist.clientId as string },
        data: {
          invoices: {
            disconnect: {
              id: invoiceExist.id
            }
          }
        }
      }),
      prisma.project.update({
        where: { id: invoiceExist.projectId as string },
        data: {
          invoices: {
            disconnect: {
              id: invoiceExist.id
            }
          },
          status: "BLOCKED",
          amount: "0",
          balance: "0"
        }
      }),
      prisma.invoice.delete({ where: { id: invoiceExist.id } }),
      prisma.invoice.create({
        data: {
          totalHT: data.totalHT,
          discount: data.discount!,
          discountType: data.discountType,
          pathFiles: folderFile,
          paymentLimit: data.paymentLimit,
          totalTTC: data.totalTTC,
          payee: data.payee!,
          note: data.note!,
          files: savedFilePaths,
          items: {
            createMany: {
              data: [
                ...data.item.billboards?.map(billboard => ({
                  name: billboard.name,
                  description: billboard.description ?? "",
                  quantity: billboard.quantity,
                  price: billboard.price,
                  updatedPrice: billboard.updatedPrice,
                  discount: billboard.discount!,
                  locationStart: billboard.locationStart ?? new Date(),
                  locationEnd: billboard.locationEnd ?? projectExist.deadline,
                  discountType: billboard.discountType as string,
                  currency: billboard.currency!,
                  billboardId: billboard.billboardId,
                  itemType: billboard.itemType ?? "billboard"
                })) ?? [],
                ...data.item.productServices?.map(productService => ({
                  name: productService.name,
                  description: productService.description ?? "",
                  quantity: productService.quantity,
                  price: productService.price,
                  updatedPrice: productService.updatedPrice,
                  locationStart: new Date(),
                  locationEnd: projectExist.deadline,
                  discount: productService.discount!,
                  discountType: productService.discountType as string,
                  currency: productService.currency!,
                  productServiceId: productService.productServiceId,
                  itemType: productService.itemType ?? "product"
                })) ?? []
              ]
            },
          },
          project: {
            connect: {
              id: data.projectId
            }
          },
          client: {
            connect: {
              id: data.clientId
            }
          },
          company: {
            connect: {
              id: data.companyId
            }
          },
          billboards: {
            connect: data.item.billboards?.map(billboard => ({
              id: billboard.billboardId
            })) ?? []
          },
          productsServices: {
            connect: data.item.productServices?.map(productService => ({
              id: productService.productServiceId
            })) ?? []
          },
        },
      }),
      prisma.project.update({
        where: {
          id: projectExist.id
        },
        data: { status: "TODO", amount: data.totalTTC }
      }),
      prisma.client.update({
        where: { id: data.clientId },
        data: {
          billboards: {
            connect: [
              ...data.item.billboards?.map(billboard => ({
                id: billboard.billboardId
              })) ?? []
            ]
          }
        }
      }),
      ...(data.item.billboards?.map(billboard => (
        prisma.billboard.update({
          where: {
            id: billboard.billboardId
          },
          data: {
            locationStart: new Date(),
            locationEnd: projectExist.deadline,
          }
        })
      )) ?? []),
      ...(data.item.productServices?.map(productService => (
        prisma.productService.update({
          where: {
            id: productService.productServiceId
          },
          data: {
            quantity: {
              decrement: productService.quantity
            },
          }
        })
      )) ?? [])
    ])

    // Réponse succès
    return NextResponse.json({
      status: "success",
      message: "Facture modifiée avec succès.",
      data: updatedInvoice,
    });

  } catch (error) {
    // En cas d'erreur, suppression des fichiers enregistrés pendant ce processus
    await removePath([...savedFilePaths]);
    console.error("Erreur mise à jour facture :", error);
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
    include: {
      items: true
    }
  });

  if (!invoice) {
    return NextResponse.json({
      message: "Facture introuvable.",
      state: "error",
    }, { status: 400 })
  }


  if (invoice?.items && invoice?.items.length > 0) {
    await rollbackInvoice(invoice as unknown as InvoiceType, invoice.companyId)
  }

  await prisma.$transaction([
    prisma.client.update({
      where: { id: invoice.clientId as string },
      data: {
        invoices: {
          disconnect: {
            id: invoice.id
          }
        }
      }
    }),
    prisma.project.update({
      where: { id: invoice.projectId as string },
      data: {
        invoices: {
          disconnect: {
            id: invoice.id
          }
        },
        status: "BLOCKED",
        amount: "0",
        balance: "0"
      }
    }),
    prisma.invoice.delete({ where: { id } })
  ]);

  await removePath([...invoice.pathFiles]);
  return NextResponse.json({
    state: "success",
    message: "Facture supprimée avec succès.",
  }, { status: 200 }
  )
}

