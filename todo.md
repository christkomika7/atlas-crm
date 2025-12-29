- Verifier que les fichiers sont detruit apres suppression
- Supprimer les fonctions non utilisées
- Faire le backup des données
- Donnée la possibilité de tout cocher ou l inverse
- supplier et client infos pas de  scrollbar
- Quand je retire le client dans facture j aimerais que l entrprise soit remis a zero
- Bloquer les pages dont le user n'a pas access
- Lorsque que j effectue une avance est ce que je dois modifier la date d echeance
- bloquer les projets au niveau de devis
- Historique paiement suppression

// Notification
(Facture, Bon de commande) echeance pour le paiement
(Facture, Bon de commande) accompte | paiement total
(Devis, Bon de livraison) validé
Transaction avec systeme d'action
Rendez vous 3 jour avant, 2h avant et la date du rendez vous
Projet date limite des taches 3 jours avant


# A faire maintenant
- Faire le revenu
- Corriger la maquette au niveau des grands nombres
- Ajouter les elements des brochures dans les parametres




import { checkAccess } from "@/lib/access";
import { createFile, createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { documentSchema, DocumentSchemaType } from "@/lib/zod/document.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {

    const result = await checkAccess("SETTING", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.formData();

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
        logo: formData.get("logo") as File,
        documents: [],
    };

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!companyExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const parsedData = (parseData<DocumentSchemaType>(documentSchema,
        data)) as DocumentSchemaType;

    const folder = createFolder([companyExist.companyName, "logo"]);
    let savedPath = "";

    try {
        savedPath = await createFile(parsedData.logo, folder, "logo");
        const createDocument = await prisma.documentModel.create({
            data: {
                logo: savedPath,
                position: parsedData.position ?? "",
                size: parsedData.size ?? "",
                primaryColor: parsedData.primaryColor ?? "",
                secondaryColor: parsedData.secondaryColor ?? "",

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

                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Document créé avec succès.",
            data: createDocument,
        });
    }
    catch (error) {
        await removePath(savedPath)
        console.log({ error })

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création du modèle de document.",
        }, { status: 500 });
    }




}

