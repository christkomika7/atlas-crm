import { checkAccess } from "@/lib/access";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
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
  // 1. Contrôle d’accès et récupération de l’ID
  await checkAccess(["INVOICES"], "MODIFY");
  const id = getIdFromUrl(req.url, "last") as string;

  // 2. Récupération et parsing des données du formulaire
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
  // On parse les listes JSON et on adapte les dates
  const productServicesParse = JSON.parse(rawData.productServices || "[]");
  const billboardsParse = JSON.parse(rawData.billboards || "[]");
  const data = parseData<InvoiceUpdateSchemaType>(invoiceUpdateSchema, {
    ...rawData,
    item: {
      productServices: productServicesParse,
      billboards: billboardsParse?.map((b: any) => ({
        ...b,
        locationStart: new Date(b.locationStart),
        locationEnd: new Date(b.locationEnd)
      })) ?? []
    },
    lastUploadFiles: JSON.parse(rawData.lastUploadFiles || "[]"),
    lastUploadPhotos: JSON.parse(rawData.lastUploadPhotos || "[]"),
    files,
    photos,
    invoiceNumber: parseInt(rawData.invoiceNumber)
  }) as InvoiceUpdateSchemaType;

  // 3. Vérification que la facture, l’entreprise, le client et le projet existent
  const [invoiceExist, companyExist, clientExist, projectExist] =
    await prisma.$transaction([
      prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
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

  // 4. Préparation des dossiers pour les fichiers
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

  // 5. Mise à jour des fichiers (documents et photos)
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
  const savedPhotoPaths = await updateFiles({
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
    // 6. Différentiation des articles (items) : existants vs nouveaux vs supprimés
    const invoiceItems = invoiceExist.items;
    const oldBillboardIds = invoiceItems
      .filter(i => i.billboardId)
      .map(i => i.billboardId!);
    const oldProductIds = invoiceItems
      .filter(i => i.productServiceId)
      .map(i => i.productServiceId!);

    // Nouveaux articles à créer
    const newBillboardItems = (data.item.billboards || [])
      .filter(b => b.billboardId && !oldBillboardIds.includes(b.billboardId));
    const newProductItems = (data.item.productServices || [])
      .filter(p => p.productServiceId && !oldProductIds.includes(p.productServiceId));
    // Articles existants à mettre à jour
    const updateBillboardItems = (data.item.billboards || [])
      .filter(b => b.billboardId && oldBillboardIds.includes(b.billboardId));
    const updateProductItems = (data.item.productServices || [])
      .filter(p => p.productServiceId && oldProductIds.includes(p.productServiceId));
    // Articles à supprimer : présents dans invoiceExist mais plus dans la requête
    const removeBillboardItems = invoiceItems.filter(i =>
      i.billboardId && !(data.item.billboards || []).some(b => b.billboardId === i.billboardId)
    );
    const removeProductItems = invoiceItems.filter(i =>
      i.productServiceId && !(data.item.productServices || []).some(p => p.productServiceId === i.productServiceId)
    );

    // 7. Transaction : suppression des anciens articles et restauration des stocks
    await prisma.$transaction([
      // Réajuster le stock des produits/services supprimés (remettre la quantité)
      ...removeProductItems.map(item =>
        prisma.productService.update({
          where: { id: item.productServiceId! },
          data: { quantity: { increment: item.quantity } }
        })
      ),
      // Libérer les dates des panneaux supprimés
      ...removeBillboardItems.map(item =>
        prisma.billboard.update({
          where: { id: item.billboardId! },
          data: { locationStart: null, locationEnd: null }
        })
      ),
      // Supprimer les enregistrements d'item correspondants
      prisma.item.deleteMany({
        where: {
          id: {
            in: removeBillboardItems.map(i => i.id)
              .concat(removeProductItems.map(i => i.id))
          }
        }
      })
    ]);

    // 8. Gestion des quantités pour les articles mis à jour (différences éventuelles)
    await prisma.$transaction(
      updateProductItems
        .map(item => {
          const oldItem = invoiceItems.find(i => i.productServiceId === item.productServiceId);
          if (!oldItem) return null;
          const diff = item.quantity - oldItem.quantity;
          if (diff > 0) {
            // quantité augmentée dans la facture -> retirer du stock
            return prisma.productService.update({
              where: { id: item.productServiceId },
              data: { quantity: { decrement: diff } }
            });
          } else if (diff < 0) {
            // quantité réduite -> remettre au stock
            return prisma.productService.update({
              where: { id: item.productServiceId },
              data: { quantity: { increment: -diff } }
            });
          }
          return null;
        })
        .filter(Boolean) as any[]
    );

    // 9. Mise à jour des dates pour les panneaux mis à jour
    await prisma.$transaction(
      updateBillboardItems.map(item =>
        prisma.billboard.update({
          where: { id: item.billboardId! },
          data: {
            locationStart: item.locationStart,
            locationEnd: item.locationEnd
          }
        })
      )
    );

    // 10. Mise à jour de la facture elle-même (totaux, liaisons, connexions/déconnexions)
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        totalHT: data.totalHT,
        discount: data.discount,
        discountType: data.discountType,
        totalTTC: data.totalTTC,
        payee: data.payee,
        note: data.note,
        pathFiles: folderFile,
        pathPhotos: folderPhoto,
        files: savedFilePaths,
        photos: savedPhotoPaths,
        // Déconnecter les anciens liens M:N
        billboards: {
          disconnect: removeBillboardItems.map(i => ({ id: i.billboardId! })),
          connect: newBillboardItems.map(b => ({ id: b.billboardId }))
        },
        productsServices: {
          disconnect: removeProductItems.map(i => ({ id: i.productServiceId! })),
          connect: newProductItems.map(p => ({ id: p.productServiceId }))
        },
        // Créer les nouveaux articles liés à la facture
        items: {
          create: [
            ...newBillboardItems.map(b => ({
              name: b.name,
              description: b.description || "",
              quantity: b.quantity,
              price: b.price,
              updatedPrice: b.updatedPrice,
              discount: b.discount || "",
              locationStart: b.locationStart!,
              locationEnd: b.locationEnd! || projectExist.deadline,
              discountType: b.discountType,
              currency: b.currency!,
              billboardId: b.billboardId,
              itemType: b.itemType || "billboard"
            })),
            ...newProductItems.map(p => ({
              name: p.name,
              description: p.description || "",
              quantity: p.quantity,
              price: p.price,
              updatedPrice: p.updatedPrice,
              locationStart: new Date(),
              locationEnd: projectExist.deadline,
              discount: p.discount || "",
              discountType: p.discountType,
              currency: p.currency!,
              productServiceId: p.productServiceId,
              itemType: p.itemType || "product"
            }))
          ]
        },
        // Mettre à jour les liaisons projet/client si besoin
        project: invoiceExist.projectId !== data.projectId
          ? { connect: { id: data.projectId } }
          : undefined,
        client: invoiceExist.clientId !== data.clientId
          ? { connect: { id: data.clientId } }
          : undefined,
        company: { connect: { id: data.companyId } }
      }
    });

    // 11. Mise à jour des statuts si le projet a changé
    if (invoiceExist.projectId !== data.projectId) {
      await prisma.project.update({
        where: { id: invoiceExist.projectId },
        data: { status: "BLOCKED" }
      });
      await prisma.project.update({
        where: { id: data.projectId },
        data: { status: "TODO" }
      });
    }

    // 12. Si le client a changé, associer les panneaux au nouveau client
    if (invoiceExist.clientId !== data.clientId) {
      await prisma.client.update({
        where: { id: data.clientId },
        data: {
          billboards: {
            connect: [
              ...updateBillboardItems.map(b => ({ id: b.billboardId! })),
              ...newBillboardItems.map(b => ({ id: b.billboardId }))
            ]
          }
        }
      });
    }

    // Réponse succès
    return NextResponse.json({
      status: "success",
      message: "Facture modifiée avec succès.",
      data: updatedInvoice,
    });
  } catch (error) {
    // En cas d'erreur, suppression des fichiers enregistrés pendant ce processus
    await removePath([...savedFilePaths, ...savedPhotoPaths]);
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

