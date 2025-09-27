'use server';
import path from "path";
import fs from "fs-extra";
import { existsSync } from "fs";
import mime from "mime-types";
import prisma from "./prisma";
import { removePath, saveFile } from "./file";
import { BillboardItem, ConflictResult, ExistingBillboardItem, InvoiceType } from "@/types/invoice.types";
import { format, isAfter, isBefore, isEqual, isValid, setDate } from "date-fns";

// @ts-ignore - on utilise la classe globale File de Node 18+
const NodeFile = globalThis.File;

export async function getFileFromPath(filePath: string): Promise<File | null> {
    try {
        // Nettoyage éventuel du chemin (en cas de préfixe erroné)
        const cleanPath = filePath.replace(/^uploads[\/\\]?/, "");

        // Point ici vers "uploads" et non "public"
        const fullPath = path.join(process.cwd(), "uploads", cleanPath);

        const buffer = await fs.readFile(fullPath);
        const uint8Array = new Uint8Array(buffer);

        const type = mime.lookup(fullPath) || "application/octet-stream";
        const name = path.basename(fullPath);

        return new File([uint8Array], name, { type });
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier:", err);
        return null;
    }
}


// Fonction séparée pour gérer les fichiers après la transaction
export async function handleFileOperations(result: any, data: any, companyHasChangeName: boolean) {
    const uploadedPaths: string[] = [];

    try {
        // Traiter les fichiers des nouveaux utilisateurs
        for (const user of result.usersToAdd) {
            const folder = path.join(
                data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                "user",
                `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
            );

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion des fichiers
            if (user.image && folder) {
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }
            if (user.passport && folder) {
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }
            if (user.document && folder) {
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les chemins des fichiers
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || null,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || null,
                            internalRegulations: documentPath || null,
                        },
                    },
                },
            });
        }

        // Traiter les fichiers des utilisateurs mis à jour
        for (const user of result.usersToUpdate) {
            const olderUserVersion = await prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true }
            });

            if (!olderUserVersion) continue;

            const usernameHasChange = (
                olderUserVersion.name.toLowerCase() !==
                `${user.firstname} ${user.lastname}`.toLowerCase()
            );

            let folder = (usernameHasChange || companyHasChangeName)
                ? path.join(
                    data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                    "user",
                    `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
                )
                : olderUserVersion.path || "";

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion du déplacement des dossiers
            if (usernameHasChange || companyHasChangeName) {
                if (olderUserVersion.path && existsSync(olderUserVersion.path)) {
                    await fs.mkdir(folder, { recursive: true });
                    const files = await fs.readdir(olderUserVersion.path);
                    for (const file of files) {
                        await fs.rename(
                            path.join(olderUserVersion.path, file),
                            path.join(folder, file)
                        );
                    }
                    await fs.rmdir(olderUserVersion.path);
                }
            }

            // Gestion des fichiers
            if (user.image && folder) {
                if (olderUserVersion.image) {
                    await removePath(olderUserVersion.image);
                }
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }

            if (user.passport && folder) {
                if (olderUserVersion.profile?.passport) {
                    await removePath(olderUserVersion.profile.passport);
                }
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }

            if (user.document && folder) {
                if (olderUserVersion.profile?.internalRegulations) {
                    await removePath(olderUserVersion.profile.internalRegulations);
                }
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les nouveaux chemins
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || olderUserVersion.image,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || olderUserVersion.profile?.passport,
                            internalRegulations: documentPath || olderUserVersion.profile?.internalRegulations,
                        },
                    },
                },
            });
        }

        // Nettoyer les fichiers des utilisateurs supprimés
        // (cette partie peut être faite de manière asynchrone)

    } catch (error) {
        // Nettoyage en cas d'erreur
        for (const path of uploadedPaths) {
            await removePath(path).catch(console.error);
        }
        throw error;
    }
}


export async function rollbackInvoice(invoiceExist: InvoiceType, companyId: string) {
    // 1. Regrouper les quantités par productService à restaurer
    const productServiceItems = invoiceExist.items
        .filter((it: any) => it.itemType !== "billboard" && it.productServiceId)
        .reduce<Record<string, number>>((acc, it) => {
            acc[String(it.productServiceId)] = (acc[String(it.productServiceId)] || 0) + it.quantity;
            return acc;
        }, {});

    // 2. Préparer les updates produits (restaurer le stock)
    const productServiceUpdates = invoiceExist.productsServices.map((productService: any) =>
        prisma.productService.update({
            where: { id: productService.id },
            data: {
                quantity: {
                    increment: productServiceItems[productService.id] || 0,
                },
            },
        })
    );

    // 3. Transaction : suppression items + déconnexion + restauration stock
    await prisma.$transaction([
        // Supprimer les items EN PREMIER (plus propre)
        prisma.item.deleteMany({ where: { invoiceId: invoiceExist.id } }),

        // Déconnecter les relations
        prisma.invoice.update({
            where: { id: invoiceExist.id },
            data: {
                productsServices: { disconnect: invoiceExist.productsServices.map((ps: any) => ({ id: ps.id })) },
                billboards: { disconnect: invoiceExist.billboards.map((b: any) => ({ id: b.id })) },
            },
        }),

        // Restaurer les stocks
        ...productServiceUpdates,
    ]);

    // 4. Récupérer les derniers items billboard RESTANTS (après suppression de la facture)
    const allBillboardItems = await prisma.item.findMany({
        where: {
            itemType: "billboard",
            invoice: { companyId },
            billboardId: { not: null },
        },
        orderBy: { createdAt: "desc" },
        include: { billboard: true, invoice: true },
    });

    // 5. Garder seulement le plus récent par billboard
    const recentBillboardItems = Object.values(
        allBillboardItems.reduce<Record<string, typeof allBillboardItems[0]>>((acc, item) => {
            if (!acc[item.billboardId!]) {
                acc[item.billboardId!] = item;
            }
            return acc;
        }, {})
    );

    // 6. Restaurer l'état des billboards avec les valeurs des items restants les plus récents
    if (recentBillboardItems.length > 0) {
        await prisma.$transaction(
            recentBillboardItems.map((item) =>
                prisma.billboard.update({
                    where: { id: item.billboardId! },
                    data: {
                        locationStart: item.locationStart,
                        locationEnd: item.locationEnd,
                    },
                })
            )
        );
    }

    // 7. Si certains billboards n'ont plus d'items, les remettre à leur état par défaut
    const billboardsToReset = invoiceExist.billboards.filter((billboard: any) =>
        !recentBillboardItems.some(item => item.billboardId === billboard.id)
    );

    if (billboardsToReset.length > 0) {
        await prisma.$transaction(
            billboardsToReset.map((billboard: any) =>
                prisma.billboard.update({
                    where: { id: billboard.id },
                    data: {
                        locationStart: null, // ou billboard.defaultLocationStart
                        locationEnd: null,   // ou billboard.defaultLocationEnd
                    },
                })
            )
        );
    }
}

export async function rollbackInvoiceSimple(invoiceExist: InvoiceType, companyId: string) {
    // 1. Regrouper les quantités par productService
    const productServiceItems = invoiceExist.items
        .filter((it: any) => it.itemType !== "billboard" && it.productServiceId)
        .reduce<Record<string, number>>((acc, it) => {
            acc[String(it.productServiceId)] = (acc[String(it.productServiceId)] || 0) + it.quantity;
            return acc;
        }, {});

    // 2. Préparer les updates produits
    const productServiceUpdates = invoiceExist.productsServices.map((productService: any) =>
        prisma.productService.update({
            where: { id: productService.id },
            data: {
                quantity: {
                    increment: productServiceItems[productService.id] || 0,
                },
            },
        })
    );

    // 3. Transaction unique et simple
    await prisma.$transaction([
        // Supprimer les items en premier
        prisma.item.deleteMany({ where: { invoiceId: invoiceExist.id } }),

        // Déconnecter les relations
        prisma.invoice.update({
            where: { id: invoiceExist.id },
            data: {
                productsServices: { disconnect: invoiceExist.productsServices.map((ps: any) => ({ id: ps.id })) },
                billboards: { disconnect: invoiceExist.billboards.map((b: any) => ({ id: b.id })) },
            },
        }),

        // Restaurer les stocks
        ...productServiceUpdates,
    ]);
}


function hasDateOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
): boolean {
    console.log('=== Vérification de chevauchement ===');
    console.log({
        nouvelle_plage: {
            debut: format(start1, 'dd/MM/yyyy HH:mm:ss'),
            fin: format(end1, 'dd/MM/yyyy HH:mm:ss')
        },
        plage_existante: {
            debut: format(start2, 'dd/MM/yyyy HH:mm:ss'),
            fin: format(end2, 'dd/MM/yyyy HH:mm:ss')
        }
    });

    // Vérifier que les dates sont valides
    if (!isValid(start1) || !isValid(end1) || !isValid(start2) || !isValid(end2)) {
        console.log('❌ Une ou plusieurs dates sont invalides');
        return false;
    }

    // Vérifier que chaque plage est cohérente (début <= fin)
    if (isAfter(start1, end1)) {
        console.log('❌ Nouvelle plage incohérente : début > fin');
        return false;
    }

    if (isAfter(start2, end2)) {
        console.log('❌ Plage existante incohérente : début > fin');
        return false;
    }

    // Deux plages se chevauchent si :
    // - Le début de la première est avant ou égal à la fin de la seconde ET
    // - Le début de la seconde est avant ou égal à la fin de la première
    // 
    // En d'autres termes : start1 <= end2 && start2 <= end1
    const condition1 = isBefore(start1, end2) || isEqual(start1, end2); // start1 <= end2
    const condition2 = isBefore(start2, end1) || isEqual(start2, end1); // start2 <= end1

    const hasOverlap = condition1 && condition2;

    console.log({
        'start1 <= end2': condition1,
        'start2 <= end1': condition2,
        'chevauchement': hasOverlap
    });

    if (hasOverlap) {
        console.log('🔴 CONFLIT DÉTECTÉ - Les périodes se chevauchent');
    } else {
        console.log('✅ Aucun conflit - Les périodes ne se chevauchent pas');
    }
    return hasOverlap;
}


function parseDate(date: Date | undefined | null): Date | null {
    if (!date) return null;
    if (date instanceof Date && !isNaN(date.getTime())) return date
    return null;
}


export async function checkBillboardConflicts(
    billboards: BillboardItem[],
    excludeInvoiceIds?: string[]
): Promise<ConflictResult> {

    // Filtrer UNIQUEMENT les items de type billboard avec des IDs et dates valides
    const validBillboards = billboards.filter(
        (item): item is BillboardItem & { billboardId: string } =>
            item.itemType === "billboard" && // IMPORTANT : vérifier le type
            item.billboardId !== undefined &&
            item.billboardId !== null &&
            item.locationStart !== undefined &&
            item.locationEnd !== undefined
    );

    if (validBillboards.length === 0) {
        return { hasConflict: false, conflicts: [] };
    }

    // Récupérer les IDs des billboards
    const billboardIds = validBillboards.map(b => b.billboardId);

    // Récupérer les items existants pour ces billboards
    const existingItems = await prisma.item.findMany({
        where: {
            billboardId: { in: billboardIds },
            itemType: "billboard",
            ...(excludeInvoiceIds && excludeInvoiceIds.length > 0 && {
                invoiceId: { notIn: excludeInvoiceIds }
            })
        },
        include: {
            invoice: {
                select: { id: true }
            }
        }
    });

    const conflicts: ConflictResult['conflicts'] = [];

    console.log({ validBillboards });


    // Vérifier chaque nouveau billboard
    for (const newBillboard of validBillboards) {
        const newStart = parseDate(newBillboard.locationStart);
        const newEnd = parseDate(newBillboard.locationEnd);

        // Ignorer si les dates ne sont pas valides
        if (!newStart || !newEnd) {
            continue;
        }

        // Vérifier que la date de fin est après la date de début
        if (newEnd < newStart) {
            conflicts.push({
                newItem: newBillboard,
                conflictingItem: null as any,
                message: `Date de fin antérieure à la date de début pour le panneau "${newBillboard.name}" (${newBillboard.billboardId})`
            });
            continue;
        }

        // Chercher les conflits avec les items existants
        const conflictingItems = existingItems.filter(existingItem => {
            // Même billboard
            if (existingItem.billboardId !== newBillboard.billboardId) {
                return false;
            }

            const existingStart = existingItem.locationStart;
            const existingEnd = existingItem.locationEnd;

            // Ignorer si les dates existantes ne sont pas valides
            if (!existingStart || !existingEnd) {
                return false;
            }

            // Vérifier le chevauchement des dates
            return hasDateOverlap(newStart, newEnd, existingStart, existingEnd);
        });

        // Ajouter les conflits trouvés
        conflictingItems.forEach(conflictingItem => {
            conflicts.push({
                newItem: newBillboard,
                conflictingItem: conflictingItem as ExistingBillboardItem,
                message: `Conflit détecté pour le panneau "${newBillboard.name}" (${newBillboard.billboardId}): nouvelle période (${newStart.toLocaleDateString()} - ${newEnd.toLocaleDateString()}) chevauche avec une période existante (${conflictingItem.locationStart!.toLocaleDateString()} - ${conflictingItem.locationEnd!.toLocaleDateString()})`
            });
        });
    }

    return {
        hasConflict: conflicts.length > 0,
        conflicts
    };
}
