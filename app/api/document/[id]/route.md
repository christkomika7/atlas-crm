import { checkAccess, sessionAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { documentSchema, DocumentSchemaType } from "@/lib/zod/document.schema";
import { NextResponse, type NextRequest } from "next/server";
import { uploadFileSingle, uploadFiles, deleteFile } from "@/lib/s3";

export async function GET(req: NextRequest) {
    const result = await checkAccess(
        ["SETTING", "INVOICES", "QUOTES", "PURCHASE_ORDER", "DELIVERY_NOTES"],
        "READ",
    );

    if (!result.authorized) {
        return Response.json({ state: "error", message: result.message }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    const document = await prisma.documentModel.findUnique({
        where: { companyId: id },
        include: { company: true },
    });

    return NextResponse.json({ state: "success", data: document, message: "" }, { status: 200 });
}

export async function PUT(req: NextRequest) {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json(
            { status: "error", message: "Aucune session trouvée", data: [] },
            { status: 401 },
        );
    }

    const id = getIdFromUrl(req.url, "last") as string;
    const formData = await req.formData();

    const logoRaw = formData.get("logo");
    // ✅ Logo seulement si c'est un vrai File avec contenu
    const logo = logoRaw instanceof File && logoRaw.size > 0 ? logoRaw : undefined;

    const documentsRaw = formData.getAll("documents") as File[];
    // ✅ Documents seulement si des fichiers sont envoyés
    const newDocuments = documentsRaw.filter((f) => f instanceof File && f.size > 0);
    const hasNewDocuments = newDocuments.length > 0;

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
        logo: logo,
        documents: newDocuments,
    };

    const [companyExist, documentExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.companyId } }),
        prisma.documentModel.findUnique({ where: { id } }),
    ]);

    if (!companyExist || !documentExist) {
        return NextResponse.json(
            { status: "error", message: "Aucun élément trouvé pour cet identifiant." },
            { status: 404 },
        );
    }

    const parsedData = parseData<DocumentSchemaType>(documentSchema, data) as DocumentSchemaType;

    // ✅ Clés uploadées — pour rollback en cas d'erreur
    const uploadedKeys: string[] = [];

    try {
        // ── Logo ──────────────────────────────────────────────────────────────
        let finalLogoKey: string | null = documentExist.logo ?? null;

        if (logo) {
            // ✅ Nouveau logo envoyé → supprime l'ancien puis upload le nouveau
            if (documentExist.logo) {
                await deleteFile(documentExist.logo).catch((e) =>
                    console.warn("Impossible de supprimer l'ancien logo:", e)
                );
            }
            finalLogoKey = await uploadFileSingle(uploadedKeys, parsedData.logo);
        }
        // ✅ Pas de logo envoyé → on garde l'existant tel quel (finalLogoKey inchangé)

        // ── Documents ─────────────────────────────────────────────────────────
        let finalDocumentKeys: string[] = documentExist.recordFiles ?? [];

        if (hasNewDocuments) {
            // ✅ Nouveaux documents envoyés → supprime les anciens puis upload les nouveaux
            if (documentExist.recordFiles?.length > 0) {
                await Promise.allSettled(
                    documentExist.recordFiles.map((key) =>
                        deleteFile(key).catch((e) =>
                            console.warn(`Impossible de supprimer le document ${key}:`, e)
                        )
                    )
                );
            }
            finalDocumentKeys = await uploadFiles(uploadedKeys, parsedData.documents);
        }
        // ✅ Pas de nouveaux documents → on garde les existants tel quels

        // ── Mise à jour BDD ───────────────────────────────────────────────────
        const updatedDocument = await prisma.documentModel.update({
            where: { id },
            data: {
                logo: finalLogoKey,
                recordFiles: finalDocumentKeys,
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
                company: { connect: { id: data.companyId } },
            },
        });

        return NextResponse.json({
            status: "success",
            message: "Document modifié avec succès.",
            data: updatedDocument,
        });

    } catch (error) {
        // ✅ Rollback — supprime les fichiers uploadés lors de cette requête
        await Promise.allSettled(
            uploadedKeys.map((key) =>
                deleteFile(key).catch((e) =>
                    console.warn(`Rollback — impossible de supprimer ${key}:`, e)
                )
            )
        );

        console.error("Erreur PUT document:", error);

        return NextResponse.json(
            { status: "error", message: "Erreur lors de la modification du modèle de document." },
            { status: 500 },
        );
    }
}