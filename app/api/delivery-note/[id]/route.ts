import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { toUtcDateOnly } from "@/lib/date";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion, rollbackDeliveryNote } from "@/lib/server";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { deliveryNoteUpdateSchema, DeliveryNoteUpdateSchemaType } from "@/lib/zod/delivery-note.schema";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { ItemType } from "@/types/item.type";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await checkAccess(["DELIVERY_NOTES"], "READ");
  const companyId = getIdFromUrl(req.url, "last") as string;

  if (!companyId) {
    return NextResponse.json({
      state: "error",
      message: "Aucun bon de livraison trouvé.",
    }, { status: 404 });
  }

  const lastDeliveryNote = await prisma.deliveryNote.findFirst({
    where: { companyId },
    orderBy: { deliveryNoteNumber: "desc" },
    select: { deliveryNoteNumber: true },
  });

  return NextResponse.json({
    state: "success",
    data: lastDeliveryNote ? lastDeliveryNote.deliveryNoteNumber + 1 : 1,
  }, { status: 200 })
}

export async function POST(req: NextRequest) {
  await checkAccess(["DELIVERY_NOTES"], "READ");
  const id = getIdFromUrl(req.url, "last") as string;
  const { data }: { data: "complete" | "progress" } = await req.json();

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun bon de livraison trouvé.",
    }, { status: 404 });
  }

  const deliveryNotes = await prisma.deliveryNote.findMany({
    where: {
      companyId: id,
      isCompleted: data === "complete" ? true : false
    },
    include: {
      client: true,
      project: true,
      items: {
        where: {
          state: "IGNORE"
        }
      },
      company: {
        include: {
          documentModel: true
        }
      }
    },
    orderBy: {
      deliveryNoteNumber: "desc"
    }
  });

  return NextResponse.json(
    {
      state: "success",
      data: deliveryNotes,
    },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  await checkAccess(["DELIVERY_NOTES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;


  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun bon de livraison trouvé.",
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

  const data = parseData<DeliveryNoteUpdateSchemaType>(deliveryNoteUpdateSchema, {
    ...rawData,
    totalHT: new Decimal(rawData.totalHT),
    totalTTC: new Decimal(rawData.totalTTC),
    amountType: rawData.amountType as 'TTC' | 'HT',
    deliveryNoteNumber: parseInt(rawData.deliveryNoteNumber),
    item: {
      productServices: productServicesParse?.map((b: ItemType) => ({
        id: b.id,
        name: b.name,
        quantity: b.quantity,
        hasTax: b.hasTax,
        locationStart: toUtcDateOnly(b.locationStart),
        locationEnd: toUtcDateOnly(b.locationEnd),
        description: b.description,
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
        name: b.name,
        hasTax: b.hasTax,
        description: b.description,
        quantity: b.quantity,
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

  }) as DeliveryNoteUpdateSchemaType;

  const [deliveryNoteExist, companyExist, clientExist, projectExist] =
    await prisma.$transaction([
      prisma.deliveryNote.findUnique({ where: { id }, include: { items: true, productsServices: true, billboards: true, } }),
      prisma.company.findUnique({ where: { id: data.companyId }, include: { documentModel: true } }),
      prisma.client.findUnique({ where: { id: data.clientId } }),
      prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);

  if (!deliveryNoteExist) {
    return NextResponse.json(
      { status: "error", message: "Bon de livraison introuvable." },
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

  await rollbackDeliveryNote(deliveryNoteExist as unknown as DeliveryNoteType);

  if (deliveryNoteExist.clientId !== data.clientId) {
    await prisma.$transaction([
      prisma.deliveryNote.update({
        where: { id: deliveryNoteExist.id },
        data: {
          client: {
            disconnect: {
              id: deliveryNoteExist.clientId as string
            }
          }
        }
      }),
      prisma.client.update({
        where: { id: deliveryNoteExist.clientId as string },
        data: {
          billboards: {
            disconnect: [
              ...deliveryNoteExist.items.filter(b => b.itemType === "billboard" && Boolean(b.billboardId)).map(b => ({
                id: b.billboardId as string
              }))
            ]
          }
        }
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
    ]
    )
  }

  if (deliveryNoteExist.projectId !== data.projectId) {
    await prisma.$transaction([
      prisma.deliveryNote.update({
        where: { id: deliveryNoteExist.id },
        data: {
          project: {
            disconnect: {
              id: deliveryNoteExist.projectId as string
            }
          }
        }
      })
    ]
    )
  }


  const key = generateId();
  const reference = `${companyExist.documentModel?.deliveryNotesPrefix ?? DELIVERY_NOTE_PREFIX}-${data.deliveryNoteNumber}`;
  const folder = createFolder([companyExist.companyName, "delivery-note", `${reference}_----${key}/files`]);
  const oldPath = deliveryNoteExist.pathFiles;

  const savedFilePaths = await updateFiles({
    folder: folder,
    outdatedData: {
      id: deliveryNoteExist.id,
      path: deliveryNoteExist.pathFiles,
      files: deliveryNoteExist.files,
    },
    updatedData: {
      id: data.id,
      lastUploadDocuments: data.lastUploadFiles,
    },
    files,
  });

  const itemForCreate = [
    ...data.item.billboards?.map(billboard => ({
      company: {
        connect: {
          id: data.companyId
        }
      },
      state: $Enums.ItemState.IGNORE,
      name: billboard.name,
      hasTax: billboard.hasTax,
      description: billboard.description ?? "",
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
      itemType: billboard.itemType ?? "billboard"
    })) ?? [],
    ...data.item.productServices?.map(productService => ({
      company: {
        connect: {
          id: data.companyId
        }
      },
      state: $Enums.ItemState.IGNORE,
      name: productService.name,
      hasTax: productService.hasTax,
      description: productService.description ?? "",
      quantity: productService.quantity,
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

    const [updatedDeliveryNote] = await prisma.$transaction([
      prisma.deliveryNote.update({
        where: { id: deliveryNoteExist.id },
        data: {
          totalHT: data.totalHT,
          amountType: data.amountType,
          discount: data.discount!,
          pathFiles: folder,
          discountType: data.discountType,
          paymentLimit: data.paymentLimit,
          totalTTC: data.totalTTC,
          note: data.note!,
          files: savedFilePaths,
          items: {
            createMany: {
              data: [

              ]
            },
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
    ])

    await removePath([oldPath]);

    return NextResponse.json({
      status: "success",
      message: "Bon de livraison modifié avec succès.",
      data: updatedDeliveryNote,
    });

  } catch (error) {
    await removePath([...savedFilePaths])
    console.log({ error });

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de la modification du bon de livraison.",
    }, { status: 500 });
  }

}

export async function DELETE(req: NextRequest) {
  await checkAccess(["DELIVERY_NOTES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const deliveryNote = await prisma.deliveryNote.findUnique({
    where: { id },
    include: {
      items: {
        where: {
          state: "IGNORE"
        }
      },
      billboards: true,
      productsServices: true,
      company: true
    }
  });

  if (!deliveryNote) {
    return NextResponse.json({
      message: "Bon de livraison introuvable.",
      state: "error",
    }, { status: 400 })
  }


  await checkAccessDeletion($Enums.DeletionType.DELIVERY_NOTES, [id], deliveryNote.company.id);

  if (deliveryNote?.items && deliveryNote?.items.length > 0) {
    await rollbackDeliveryNote(deliveryNote as unknown as DeliveryNoteType)
  }

  await prisma.$transaction([
    prisma.client.update({
      where: { id: deliveryNote.clientId as string },
      data: {
        deliveryNotes: {
          disconnect: {
            id: deliveryNote.id
          }
        }
      }
    }),
    prisma.project.update({
      where: { id: deliveryNote.projectId as string },
      data: {
        deliveryNotes: {
          disconnect: {
            id: deliveryNote.id
          }
        }
      }
    }),
    prisma.deliveryNote.delete({ where: { id } })
  ]);

  await removePath([...deliveryNote.pathFiles]);
  return NextResponse.json({
    state: "success",
    message: "Bon de livraison supprimée avec succès.",
  }, { status: 200 }
  )
}

