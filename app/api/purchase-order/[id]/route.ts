import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion, rollbackPurchaseOrder } from "@/lib/server";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { ItemPurchaseOrderSchemaType } from "@/lib/zod/item.schema";
import { purchaseOrderUpdateSchema, PurchaseOrderUpdateSchemaType } from "@/lib/zod/purchase-order.schema";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess("PURCHASE_ORDER", "READ");

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
      message: "Aucun bon de commande trouvé.",
    }, { status: 404 });
  }

  const lastPurchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { companyId },
    orderBy: { purchaseOrderNumber: "desc" },
    select: { purchaseOrderNumber: true },
  });

  return NextResponse.json({
    state: "success",
    data: lastPurchaseOrder ? lastPurchaseOrder.purchaseOrderNumber + 1 : 1,
  }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const result = await checkAccess("PURCHASE_ORDER", "READ");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;
  const { data }: { data: "unpaid" | "paid" } = await req.json();

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun bon de commande trouvé.",
    }, { status: 404 });
  }

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      companyId: id,
      isPaid: data === "paid" ? true : false,
    },
    include: {
      supplier: true,
      project: true,
      items: true,
      company: {
        include: {
          documentModel: true
        }
      }
    },
    orderBy: {
      purchaseOrderNumber: "desc"
    }
  });

  return NextResponse.json(
    {
      state: "success",
      data: purchaseOrders,
    },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  const result = await checkAccess("PURCHASE_ORDER", "MODIFY");

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
      message: "Aucun bon de commande trouvé.",
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


  const data = parseData<PurchaseOrderUpdateSchemaType>(purchaseOrderUpdateSchema, {
    ...rawData,
    totalHT: new Decimal(rawData.totalHT),
    totalTTC: new Decimal(rawData.totalTTC),
    payee: new Decimal(rawData.payee),
    amountType: rawData.amountType as 'TTC' | 'HT',
    item: {
      productServices: productServicesParse?.map((b: ItemPurchaseOrderSchemaType) => ({
        id: b.id,
        reference: b.reference,
        name: b.name,
        hasTax: b.hasTax,
        quantity: b.quantity,
        selectedQuantity: b.selectedQuantity,
        status: b.status,
        price: new Decimal(b.price),
        updatedPrice: new Decimal(b.updatedPrice),
        currency: b.currency,
        discount: b.discount,
        discountType: b.discountType,
        itemType: b.itemType,
        productServiceId: b.productServiceId
      })) ?? [],
    },
    lastUploadFiles: JSON.parse(rawData.lastUploadFiles),
    files,
    purchaseOrderNumber: parseInt(rawData.purchaseOrderNumber)
  }) as PurchaseOrderUpdateSchemaType;

  const [purchaseOrderExist, companyExist, supplierExist, projectExist] =
    await prisma.$transaction([
      prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true, productsServices: true } }),
      prisma.company.findUnique({ where: { id: data.companyId }, include: { documentModel: true } }),
      prisma.supplier.findUnique({ where: { id: data.supplierId } }),
      prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);

  if (!purchaseOrderExist) {
    return NextResponse.json(
      { status: "error", message: "Bon de commande introuvable." },
      { status: 404 }
    );
  }

  if (!companyExist) {
    return NextResponse.json(
      { status: "error", message: "Entreprise introuvable." },
      { status: 404 }
    );
  }

  if (!supplierExist) {
    return NextResponse.json(
      { status: "error", message: "Fournisseur introuvable." },
      { status: 404 }
    );
  }

  if (!projectExist) {
    return NextResponse.json(
      { status: "error", message: "Projet introuvable." },
      { status: 404 }
    );
  }


  if (purchaseOrderExist.isPaid) {
    return NextResponse.json(
      {
        status: "error",
        message: "Le bon de commande a déjà été réglée",
      },
      { status: 400 }
    );
  }


  const payee = purchaseOrderExist.payee;

  if (payee.eq(0)) {
    await rollbackPurchaseOrder(purchaseOrderExist as unknown as PurchaseOrderType);
  }

  if (payee.gt(0) && !purchaseOrderExist.isPaid) {
    if (purchaseOrderExist.supplierId !== data.supplierId) {
      await prisma.$transaction([
        prisma.purchaseOrder.update({
          where: { id: purchaseOrderExist.id },
          data: {
            supplier: {
              disconnect: {
                id: purchaseOrderExist.supplierId as string
              }
            }
          }
        }),
        prisma.supplier.update({
          where: { id: purchaseOrderExist.supplierId as string },
          data: {
            due: {
              decrement: purchaseOrderExist.amountType === "TTC" ? purchaseOrderExist.totalTTC : purchaseOrderExist.totalHT
            },
            paidAmount: {
              decrement: purchaseOrderExist.payee
            }
          }
        }),
        prisma.supplier.update({
          where: { id: data.supplierId },
          data: {
            due: {
              increment: data.totalTTC
            }
          }
        }),
      ])
    }

    if (purchaseOrderExist.projectId !== data.projectId) {
      await prisma.$transaction([
        prisma.purchaseOrder.update({
          where: { id: purchaseOrderExist.id },
          data: {
            project: {
              disconnect: {
                id: purchaseOrderExist.projectId as string
              }
            }
          }
        })
      ]
      )
    }
  }

  // Update file
  const key = generateId();
  const purchaseReference = `${companyExist.documentModel?.purchaseOrderPrefix ?? PURCHASE_ORDER_PREFIX}-${data.purchaseOrderNumber}`;
  const folder = createFolder([companyExist.companyName, "purchase-order", `${purchaseReference}_----${key}/files`]);
  const oldPath = purchaseOrderExist.pathFiles;

  const savedFilePaths = await updateFiles({
    folder: folder,
    outdatedData: {
      id: purchaseOrderExist.id,
      path: purchaseOrderExist.pathFiles,
      files: purchaseOrderExist.files,
    },
    updatedData: {
      id: data.id,
      lastUploadDocuments: data.lastUploadFiles,
    },
    files,
  });

  const itemForCreate = [
    ...data.item.productServices?.map(productService => ({
      state: $Enums.ItemState.PURCHASE,
      company: {
        connect: {
          id: data.companyId
        }
      },
      name: productService.name,
      reference: productService.reference,
      hasTax: productService.hasTax,
      description: productService.description,
      quantity: productService.selectedQuantity,
      price: productService.price,
      updatedPrice: productService.updatedPrice,
      locationStart: new Date(),
      locationEnd: projectExist.deadline,
      discount: productService.discount ?? "0",
      discountType: productService.discountType as string,
      currency: productService.currency!,
      productService: {
        connect: {
          id: productService.productServiceId
        }
      },
      itemType: productService.itemType ?? "product"
    })) ?? []
  ]

  try {
    const [updatedPurchaseOrder] = await prisma.$transaction([
      prisma.purchaseOrder.update({
        where: { id: purchaseOrderExist.id },
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
          supplier: {
            connect: {
              id: data.supplierId
            }
          },
          company: {
            connect: {
              id: data.companyId
            }
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
              increment: productService.selectedQuantity
            },
          }
        })
      )) ?? [])
    ])

    await removePath([oldPath]);

    return NextResponse.json({
      status: "success",
      message: "Bon de commande modifié avec succès.",
      data: updatedPurchaseOrder,
    });

  } catch (error) {
    await removePath([...savedFilePaths])
    console.log({ error });

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de la modification du bon de commande.",
    }, { status: 500 });
  }

}

export async function DELETE(req: NextRequest) {
  const result = await checkAccess("PURCHASE_ORDER", "MODIFY");

  if (!result.authorized) {
    return Response.json({
      status: "error",
      message: result.message,
      data: []
    }, { status: 200 });
  }

  const id = getIdFromUrl(req.url, "last") as string;

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: true,
      productsServices: true,
      dibursements: true,
      company: true
    }
  });

  if (!purchaseOrder) {
    return NextResponse.json({
      message: "Bon de commande introuvable.",
      state: "error",
    }, { status: 400 })
  }

  if (purchaseOrder.dibursements.length > 0) {
    return NextResponse.json({
      state: "error",
      message: "Supprimez d'abord les transactions associées à ce bon de commande.",
    }, { status: 409 });
  }

  await checkAccessDeletion($Enums.DeletionType.PURCHASE_ORDERS, [id], purchaseOrder.company.id)


  if (purchaseOrder?.items && purchaseOrder?.items.length > 0) {
    await rollbackPurchaseOrder(purchaseOrder as unknown as PurchaseOrderType)
  }

  await prisma.$transaction([
    prisma.supplier.update({
      where: { id: purchaseOrder.supplierId as string },
      data: {
        purchaseOrders: {
          disconnect: {
            id: purchaseOrder.id
          }
        },
        due: {
          decrement: purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC : purchaseOrder.totalHT
        },
        paidAmount: {
          decrement: purchaseOrder.payee
        }
      }
    }),
    prisma.project.update({
      where: { id: purchaseOrder.projectId as string },
      data: {
        purchaseOrders: {
          disconnect: {
            id: purchaseOrder.id
          }
        }
      }
    }),
    prisma.purchaseOrder.delete({ where: { id } })
  ]);

  await removePath([...purchaseOrder.pathFiles]);
  return NextResponse.json({
    state: "success",
    message: "Bon de commande supprimé avec succès.",
  }, { status: 200 }
  )
}

