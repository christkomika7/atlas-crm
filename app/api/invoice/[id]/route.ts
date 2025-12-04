import { INVOICE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { toUtcDateOnly } from "@/lib/date";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion, checkBillboardConflicts, rollbackInvoice } from "@/lib/server";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { invoiceUpdateSchema, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { InvoiceType } from "@/types/invoice.types";
import { ItemType } from "@/types/item.type";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess("INVOICES", "READ");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

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

export async function PUT(req: NextRequest) {
  const result = await checkAccess("INVOICES", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucune facture trouvée.",
    }, { status: 404 });
  }

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

  const productServicesParse = JSON.parse(rawData.productServices);
  const billboardsParse = JSON.parse(rawData.billboards);


  const data = parseData<InvoiceUpdateSchemaType>(invoiceUpdateSchema, {
    ...rawData,
    totalHT: new Decimal(rawData.totalHT),
    totalTTC: new Decimal(rawData.totalTTC),
    payee: new Decimal(rawData.payee),
    amountType: rawData.amountType as 'TTC' | 'HT',
    item: {
      productServices: productServicesParse?.map((b: ItemType) => ({
        id: b.id,
        reference: b.reference,
        name: b.name,
        hasTax: b.hasTax,
        quantity: b.quantity,
        description: b.description,
        locationStart: toUtcDateOnly(b.locationStart),
        locationEnd: toUtcDateOnly(b.locationEnd),
        price: new Decimal(b.price),
        updatedPrice: new Decimal(b.updatedPrice),
        currency: b.currency,
        discount: b.discount,
        discountType: b.discountType,
        itemType: b.itemType,
        productServiceId: b.productServiceId
      })) ?? [],
      billboards: billboardsParse?.map((b: ItemType) => ({
        id: b.id,
        reference: b.reference,
        name: b.name,
        hasTax: b.hasTax,
        quantity: b.quantity,
        description: b.description,
        locationStart: toUtcDateOnly(b.locationStart),
        locationEnd: toUtcDateOnly(b.locationEnd),
        price: new Decimal(b.price),
        updatedPrice: new Decimal(b.updatedPrice),
        currency: b.currency,
        discount: b.discount,
        discountType: b.discountType,
        itemType: b.itemType,
        billboardId: b.billboardId
      })) ?? []
    },
    lastUploadFiles: JSON.parse(rawData.lastUploadFiles),
    files,
    invoiceNumber: parseInt(rawData.invoiceNumber)
  }) as InvoiceUpdateSchemaType;

  const [invoiceExist, companyExist, clientExist, projectExist] =
    await prisma.$transaction([
      prisma.invoice.findUnique({
        where: { id }, include: {
          items: {
            where: {
              state: "APPROVED"
            }
          }, productsServices: true, billboards: true,
        }
      }),
      prisma.company.findUnique({ where: { id: data.companyId }, include: { documentModel: true } }),
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


  const billboards = data.item.billboards ?? [];
  const excludeBillboardIds = invoiceExist.items.filter(item => item.itemType === "billboard").map(item => item.billboardId).filter(b => b !== null);

  const conflictResult = await checkBillboardConflicts(billboards, excludeBillboardIds);

  if (conflictResult.hasConflict) {
    return NextResponse.json({
      status: "error",
      message: "Conflit de dates détecté pour au moins un panneau.",
    }, { status: 404 });
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


  const payee = invoiceExist.payee;

  if (payee.eq(0)) {
    await rollbackInvoice(invoiceExist as unknown as InvoiceType);
  }

  const amount = invoiceExist.amountType === "TTC" ? invoiceExist.totalTTC : invoiceExist.totalHT;

  if (payee.gt(0) && !invoiceExist.isPaid) {
    if (invoiceExist.clientId !== data.clientId) {
      await prisma.$transaction([
        prisma.invoice.update({
          where: { id: invoiceExist.id },
          data: {
            client: {
              disconnect: {
                id: invoiceExist.clientId as string
              }
            }
          }
        }),
        prisma.client.update({
          where: { id: invoiceExist.clientId as string },
          data: {
            due: {
              decrement: amount
            },
            paidAmount: {
              decrement: invoiceExist.payee
            },
            billboards: {
              disconnect: [
                ...invoiceExist.items.filter(b => b.itemType === "billboard" && Boolean(b.billboardId)).map(b => ({
                  id: b.billboardId as string
                }))
              ]
            }
          }
        }),
        prisma.client.update({
          where: { id: data.clientId },
          data: {
            due: {
              increment: data.totalTTC
            },
            billboards: {
              connect: [
                ...data.item.billboards?.map(billboard => ({
                  id: billboard.billboardId
                })) ?? []
              ]
            }
          }
        }),
      ])
    }

    if (invoiceExist.projectId !== data.projectId) {
      await prisma.$transaction([
        prisma.invoice.update({
          where: { id: invoiceExist.id },
          data: {
            project: {
              disconnect: {
                id: invoiceExist.projectId as string
              }
            }
          }
        }),
        prisma.project.update({
          where: { id: invoiceExist.projectId as string },
          data: {
            status: "BLOCKED",
            amount: 0
          }
        }),
        prisma.project.update({
          where: {
            id: projectExist.id
          },
          data: { status: "TODO", amount: data.amountType === "TTC" ? data.totalTTC : data.totalHT }
        }),
      ]
      )
    }
  }

  // Update file
  const key = generateId();
  const invoiceReference = `${companyExist.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${data.invoiceNumber}`;
  const folder = createFolder([companyExist.companyName, "invoice", `${invoiceReference}_----${key}/files`]);
  const oldPath = invoiceExist.pathFiles;

  const savedFilePaths = await updateFiles({
    folder: folder,
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

    const itemForCreate = [
      ...data.item.billboards?.map(billboard => ({
        state: $Enums.ItemState.APPROVED,
        name: billboard.name,
        reference: billboard.reference,
        hasTax: billboard.hasTax,
        description: billboard.description,
        quantity: billboard.quantity,
        price: billboard.price,
        updatedPrice: billboard.updatedPrice,
        discount: billboard.discount ?? "0",
        locationStart: billboard.locationStart,
        locationEnd: billboard.locationEnd,
        discountType: billboard.discountType as string,
        currency: billboard.currency!,
        billboard: {
          connect: {
            id: billboard.billboardId
          }
        },
        itemType: billboard.itemType ?? "billboard",
        company: {
          connect: { id: data.companyId }
        },
      })) ?? [],
      ...data.item.productServices?.map(productService => ({
        state: $Enums.ItemState.APPROVED,
        name: productService.name,
        reference: productService.reference,
        hasTax: productService.hasTax,
        description: productService.description,
        quantity: productService.quantity,
        price: productService.price,
        updatedPrice: productService.updatedPrice,
        locationStart: new Date(),
        locationEnd: new Date(),
        discount: productService.discount ?? "0",
        discountType: productService.discountType as string,
        currency: productService.currency!,
        productService: {
          connect: {
            id: productService.productServiceId
          }
        },
        itemType: productService.itemType ?? "product",
        company: {
          connect: { id: data.companyId }
        },
      })) ?? []
    ]

    const [updatedInvoice] = await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoiceExist.id },
        data: {
          totalHT: data.totalHT,
          discount: data.discount!,
          pathFiles: folder,
          discountType: data.discountType,
          amountType: data.amountType,
          paymentLimit: data.paymentLimit,
          totalTTC: data.totalTTC,
          payee: data.payee,
          note: data.note!,
          files: savedFilePaths,
          items: {
            create: itemForCreate
          },
          project: {
            connect: {
              id: data.projectId
            },

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

    await removePath([oldPath]);

    return NextResponse.json({
      status: "success",
      message: "Facture modifiée avec succès.",
      data: updatedInvoice,
    });

  } catch (error) {
    await removePath([...savedFilePaths])
    console.log({ error });

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de la modification de la facture.",
    }, { status: 500 });
  }

}

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("INVOICES", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: {
        where: {
          state: "APPROVED"
        }
      },
      billboards: true,
      productsServices: true,
      receipts: true,
      payments: true,
      company: true
    }
  });

  if (!invoice) {
    return NextResponse.json({
      message: "Facture introuvable.",
      state: "error",
    }, { status: 400 })
  }

  const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.INVOICES, [id], invoice.company.id)

  if (hasAccessDeletion) {
    return NextResponse.json({
      state: "success",
      message: "Suppression en attente de validation.",
    }, { status: 200 })
  }

  if (invoice.receipts.length > 0 || invoice.payments.length > 0) {
    return NextResponse.json({
      state: "error",
      message: "Supprimez d'abord les transactions et paiements associés à cette facture.",
    }, { status: 409 });
  }

  if (invoice?.items && invoice?.items.length > 0) {
    await rollbackInvoice(invoice as unknown as InvoiceType)
  }

  await prisma.$transaction([
    prisma.client.update({
      where: { id: invoice.clientId as string },
      data: {
        invoices: {
          disconnect: {
            id: invoice.id
          }
        },
        due: {
          decrement: invoice.amountType === "TTC" ? invoice.totalTTC : invoice.totalHT
        },
        paidAmount: {
          decrement: invoice.payee
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
        amount: new Decimal(0),
        balance: new Decimal(0)
      }
    }),
    prisma.invoice.delete({ where: { id } }),
    prisma.payment.deleteMany({ where: { invoiceId: invoice.id } }),
    prisma.receipt.deleteMany({ where: { referenceInvoiceId: invoice.id } }),
  ]);

  await removePath([...invoice.pathFiles]);
  return NextResponse.json({
    state: "success",
    message: "Facture supprimée avec succès.",
  }, { status: 200 }
  )
}

