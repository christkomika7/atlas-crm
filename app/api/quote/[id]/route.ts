import { QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { toUtcDateOnly } from "@/lib/date";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { rollbackQuote } from "@/lib/server";
import { generateId, getIdFromUrl } from "@/lib/utils";
import { quoteUpdateSchema, QuoteUpdateSchemaType } from "@/lib/zod/quote.schema";
import { ItemType } from "@/types/item.type";
import { QuoteType } from "@/types/quote.types";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await checkAccess(["QUOTES"], "READ");
  const companyId = getIdFromUrl(req.url, "last") as string;

  if (!companyId) {
    return NextResponse.json({
      state: "error",
      message: "Aucun devis trouvé.",
    }, { status: 404 });
  }

  const lastQuote = await prisma.quote.findFirst({
    where: { companyId },
    orderBy: { quoteNumber: "desc" },
    select: { quoteNumber: true },
  });

  return NextResponse.json({
    state: "success",
    data: lastQuote ? lastQuote.quoteNumber + 1 : 1,
  }, { status: 200 })
}

export async function POST(req: NextRequest) {
  await checkAccess(["QUOTES"], "READ");
  const id = getIdFromUrl(req.url, "last") as string;
  const { data }: { data: "progress" | "complete" } = await req.json();

  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun devis trouvé.",
    }, { status: 404 });
  }

  const quotes = await prisma.quote.findMany({
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
      quoteNumber: "desc"
    }
  });

  return NextResponse.json(
    {
      state: "success",
      data: quotes,
    },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  await checkAccess(["QUOTES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;


  if (!id) {
    return NextResponse.json({
      status: "error",
      message: "Aucun devis trouvé.",
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

  const data = parseData<QuoteUpdateSchemaType>(quoteUpdateSchema, {
    ...rawData,
    totalHT: new Decimal(rawData.totalHT),
    totalTTC: new Decimal(rawData.totalTTC),
    quoteNumber: parseInt(rawData.quoteNumber),
    amountType: rawData.amountType as 'TTC' | 'HT',
    item: {
      productServices: productServicesParse?.map((b: ItemType) => ({
        id: b.id,
        hasTax: b.hasTax,
        name: b.name,
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

  }) as QuoteUpdateSchemaType;

  const [quoteExist, companyExist, clientExist, projectExist] =
    await prisma.$transaction([
      prisma.quote.findUnique({ where: { id }, include: { items: true, productsServices: true, billboards: true, } }),
      prisma.company.findUnique({ where: { id: data.companyId }, include: { documentModel: true } }),
      prisma.client.findUnique({ where: { id: data.clientId } }),
      prisma.project.findUnique({ where: { id: data.projectId } }),
    ]);

  if (!quoteExist) {
    return NextResponse.json(
      { status: "error", message: "Devis introuvable." },
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



  await rollbackQuote(quoteExist as unknown as QuoteType);

  if (quoteExist.clientId !== data.clientId) {
    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quoteExist.id },
        data: {
          client: {
            disconnect: {
              id: quoteExist.clientId as string
            }
          }
        }
      }),
      prisma.client.update({
        where: { id: quoteExist.clientId as string },
        data: {
          billboards: {
            disconnect: [
              ...quoteExist.items.filter(b => b.itemType === "billboard" && Boolean(b.billboardId)).map(b => ({
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

  if (quoteExist.projectId !== data.projectId) {
    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quoteExist.id },
        data: {
          project: {
            disconnect: {
              id: quoteExist.projectId as string
            }
          }
        }
      })
    ]
    )
  }


  // Update file
  const key = generateId();
  const quoteReference = `${companyExist.documentModel?.quotesPrefix ?? QUOTE_PREFIX}-${data.quoteNumber}`;
  const folder = createFolder([companyExist.companyName, "quote", `${quoteReference}_----${key}/files`]);
  const oldPath = quoteExist.pathFiles;

  const savedFilePaths = await updateFiles({
    folder: folder,
    outdatedData: {
      id: quoteExist.id,
      path: quoteExist.pathFiles,
      files: quoteExist.files,
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
      description: productService.description,
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

    const [updatedQuote] = await prisma.$transaction([
      prisma.quote.update({
        where: { id: quoteExist.id },
        data: {
          totalHT: data.totalHT,
          discount: data.discount!,
          pathFiles: folder,
          discountType: data.discountType,
          paymentLimit: data.paymentLimit,
          totalTTC: data.totalTTC,
          note: data.note!,
          files: savedFilePaths,
          amountType: data.amountType,
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
    ])

    await removePath([oldPath]);

    return NextResponse.json({
      status: "success",
      message: "Devis modifié avec succès.",
      data: updatedQuote,
    });

  } catch (error) {
    await removePath([...savedFilePaths])
    console.log({ error });

    return NextResponse.json({
      status: "error",
      message: "Erreur lors de la modification du devis.",
    }, { status: 500 });
  }

}

export async function DELETE(req: NextRequest) {
  await checkAccess(["QUOTES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: {
        where: {
          state: "IGNORE"
        }
      },
      billboards: true,
      productsServices: true
    }
  });

  if (!quote) {
    return NextResponse.json({
      message: "Devis introuvable.",
      state: "error",
    }, { status: 400 })
  }


  if (quote?.items && quote?.items.length > 0) {
    await rollbackQuote(quote as unknown as QuoteType)
  }

  await prisma.$transaction([
    prisma.client.update({
      where: { id: quote.clientId as string },
      data: {
        quotes: {
          disconnect: {
            id: quote.id
          }
        }
      }
    }),
    prisma.project.update({
      where: { id: quote.projectId as string },
      data: {
        quotes: {
          disconnect: {
            id: quote.id
          }
        }
      }
    }),
    prisma.quote.delete({ where: { id } })
  ]);

  await removePath([...quote.pathFiles]);
  return NextResponse.json({
    state: "success",
    message: "Devis supprimée avec succès.",
  }, { status: 200 }
  )
}

