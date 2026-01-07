import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import csv from "csv-parser";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

const UPLOAD_DIR = path.join(process.cwd(), "upload");
const RESTORE_TMP = path.join(process.cwd(), "tmp/restore");

// Ordre d'import STRICT respectant toutes les dépendances
const IMPORT_ORDER = [
    "company",
    "user",
    "profile",
    "session",
    "account",
    "verification",
    "rateLimit",
    "documentModel",
    "city",
    "billboardType",
    "displayBoard",
    "structureType",
    "lessorType",
    "transactionCategory",
    "source",
    "fiscalObject",
    "productService",
    "area",
    "transactionNature",
    "allocation",
    "client",
    "supplier",
    "billboard",
    "project",
    "contract",
    "invoice",
    "quote",
    "deliveryNote",
    "purchaseOrder",
    "item",
    "payment",
    "recurrence",
    "receipt",
    "dibursement",
    "dibursementData",
    "appointment",
    "task",
    "taskStep",
    "notification",
    "notificationRead",
    "permission",
    "deletion"
];

// Stocker les IDs valides par table pour validation
const validIds: Record<string, Set<string>> = {};

// Définir les champs obligatoires par modèle
const requiredFields: Record<string, string[]> = {
    invoice: ['companyId'],
    purchaseOrder: ['companyId'],
    quote: ['companyId'],
    deliveryNote: ['companyId'],
    project: ['companyId', 'clientId'],
    task: ['projectId'],
    billboard: ['companyId', 'typeId', 'areaId', 'cityId', 'displayBoardId', 'lessorTypeId'],
    appointment: ['companyId', 'clientId'],
    contract: ['companyId'],
    receipt: ['companyId', 'categoryId', 'natureId'],
    dibursement: ['companyId', 'categoryId', 'natureId'],
    profile: ['companyId', 'userId'],
    item: ['companyId'],
    notification: ['companyId'],
    permission: ['profileId'],
    client: ['companyId'],
    supplier: ['companyId'],
    area: ['companyId', 'cityId'],
    city: ['companyId'],
    transactionNature: ['companyId', 'categoryId'],
    allocation: ['companyId', 'natureId']
};

// Fonction pour parser les valeurs CSV en types corrects
function parseCSVValue(key: string, value: string, modelName: string): any {
    if (value === '' || value === 'null' || value === 'undefined') {
        return null;
    }

    if (value === 'true') return true;
    if (value === 'false') return false;

    const decimalFields = [
        'amount', 'balance', 'totalHT', 'totalTTC', 'payee', 'price',
        'updatedPrice', 'paidAmount', 'due', 'rentalPrice', 'installationCost',
        'maintenance', 'revenueGenerate', 'capital', 'unitPrice', 'cost'
    ];

    if (decimalFields.includes(key)) {
        let cleaned = value.replace(/^"|"$/g, '').trim();

        if (cleaned === '' || cleaned === 'null') {
            return new Decimal(0);
        }

        try {
            return new Decimal(cleaned);
        } catch (error) {
            console.warn(`⚠️  Erreur parsing Decimal pour ${key}: "${value}" -> défaut à 0`);
            return new Decimal(0);
        }
    }

    const intFields = [
        'key', 'reference', 'invoiceNumber', 'quoteNumber', 'deliveryNoteNumber',
        'purchaseOrderNumber', 'contractNumber', 'quantity', 'count'
    ];

    if (intFields.includes(key) || key.endsWith('Number')) {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    }

    const floatFields = ['width', 'height'];
    if (floatFields.includes(key)) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    }

    if (key === 'lastRequest') {
        try {
            return BigInt(value);
        } catch {
            return null;
        }
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn(`⚠️  Erreur parsing Array pour ${key}: "${value}"`);
            return [];
        }
    }

    if (value.startsWith('{') && value.endsWith('}')) {
        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn(`⚠️  Erreur parsing JSON pour ${key}: "${value}"`);
            return null;
        }
    }

    return value;
}

// Fonction pour valider les clés étrangères
function validateForeignKeys(data: any, modelName: string): boolean {
    const required = requiredFields[modelName] || [];

    for (const field of required) {
        const value = data[field];

        // Vérifier si le champ est null ou vide
        if (!value || value === 'null' || value === '') {
            console.warn(`⚠️  ${modelName}: champ requis ${field} est null/vide`);
            return false;
        }

        // Vérifier si c'est un ID de relation
        if (field.endsWith('Id')) {
            const relatedTable = field.replace('Id', '');
            const relatedTableLower = relatedTable.charAt(0).toLowerCase() + relatedTable.slice(1);

            // Vérifier si l'ID existe dans les données déjà importées
            if (validIds[relatedTableLower] && !validIds[relatedTableLower].has(value)) {
                console.warn(`⚠️  ${modelName}: ${field} référence un ID inexistant: ${value}`);
                return false;
            }
        }
    }

    return true;
}

// Fonction pour nettoyer les données des relations optionnelles invalides
function cleanOptionalRelations(data: any, modelName: string): any {
    const cleaned = { ...data };

    // Liste des champs de relation optionnels à vérifier
    const optionalRelations: Record<string, string[]> = {
        invoice: ['clientId', 'projectId', 'createdById'],
        purchaseOrder: ['supplierId', 'projectId', 'createdById'],
        quote: ['clientId', 'createdById'],
        deliveryNote: ['clientId', 'createdById'],
        contract: ['clientId', 'lessorId', 'billboardId'],
        billboard: ['clientId', 'lessorSupplierId', 'structureTypeId'],
        item: ['invoiceId', 'quoteId', 'billboardId', 'productServiceId', 'purchaseOrderId', 'deliveryNoteId'],
        receipt: ['clientId', 'supplierId', 'sourceId', 'referenceInvoiceId', 'paymentId'],
        dibursement: ['clientId', 'projectId', 'allocationId', 'sourceId', 'payOnBehalfOfId', 'referenceInvoiceId', 'referencePurchaseOrderId', 'fiscalObjectId', 'paymentId'],
        appointment: ['teamMemberId'],
        notification: ['userId', 'receiptId', 'dibursementId', 'invoiceId', 'quoteId', 'deliveryNoteId', 'purchaseOrderId', 'appointmentId', 'projectId', 'taskId', 'paymentDibursementId'],
        task: ['projectId']
    };

    const fieldsToCheck = optionalRelations[modelName] || [];

    for (const field of fieldsToCheck) {
        const value = cleaned[field];

        if (value && value !== 'null' && value !== '') {
            const relatedTable = field.replace('Id', '');
            const relatedTableLower = relatedTable.charAt(0).toLowerCase() + relatedTable.slice(1);

            // Si l'ID n'existe pas dans les données importées, le mettre à null
            if (validIds[relatedTableLower] && !validIds[relatedTableLower].has(value)) {
                console.warn(`⚠️  ${modelName}: Relation optionnelle ${field} invalide (${value}), mise à null`);
                cleaned[field] = null;
            }
        } else {
            // Normaliser les valeurs vides en null
            cleaned[field] = null;
        }
    }

    return cleaned;
}

// Fonction pour préparer les données avant insertion
function prepareDataForInsert(row: any, modelName: string): any {
    const prepared: any = {};

    for (const [key, value] of Object.entries(row)) {
        prepared[key] = parseCSVValue(key, value as string, modelName);
    }

    return prepared;
}

// Fonction pour obtenir le nom de la table PostgreSQL
function getTableNameForDB(modelName: string): string {
    const mapping: Record<string, string> = {
        'company': 'company',
        'user': 'user',
        'profile': 'profile',
        'supplier': 'supplier',
        'client': 'client',
        'appointment': 'appointment',
        'contract': 'contract',
        'billboard': 'billboard',
        'invoice': 'invoice',
        'purchaseOrder': 'purchase_order',
        'quote': 'quote',
        'deliveryNote': 'delivery_note',
        'recurrence': 'recurrence',
        'payment': 'payment',
        'item': 'item',
        'project': 'project',
        'task': 'task',
        'taskStep': 'task_step',
        'city': 'city',
        'area': 'area',
        'billboardType': 'billboard_type',
        'displayBoard': 'display_board',
        'structureType': 'structure_type',
        'lessorType': 'lessor_type',
        'documentModel': 'company_documents',
        'receipt': 'receipt',
        'dibursement': 'dibursement',
        'source': 'source',
        'fiscalObject': 'fiscal_object',
        'transactionCategory': 'transaction_category',
        'transactionNature': 'transaction_nature',
        'allocation': 'allocation',
        'deletion': 'deletion',
        'notification': 'notification',
        'notificationRead': 'notification_read',
        'dibursementData': 'dibursement_data',
        'permission': 'permission',
        'session': 'session',
        'account': 'account',
        'verification': 'verification',
        'rateLimit': 'rateLimit',
        'productService': 'product_service'
    };

    return mapping[modelName] || modelName;
}

export async function POST(req: NextRequest) {
    console.log("🔄 Début de la restauration du backup");

    const auth = await checkAccess("SETTING", "MODIFY");
    if (!auth.authorized) {
        return NextResponse.json({
            status: "error",
            message: auth.message,
        }, { status: 403 });
    }

    try {
        // Réinitialiser le tracker d'IDs valides
        Object.keys(validIds).forEach(key => delete validIds[key]);

        // 1. Récupérer le fichier ZIP
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({
                status: "error",
                message: "Fichier zip manquant."
            }, { status: 400 });
        }

        console.log(`📦 Fichier reçu: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        // 2. Sauvegarder temporairement le ZIP
        const tmpZipPath = path.join(process.cwd(), "tmp", "backup_import.zip");

        const tmpDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const arrayBuffer = await file.arrayBuffer();
        fs.writeFileSync(tmpZipPath, Buffer.from(arrayBuffer));
        console.log("✅ Fichier ZIP sauvegardé temporairement");

        // 3. Extraction du ZIP
        console.log("📂 Extraction du ZIP...");
        const zip = new AdmZip(tmpZipPath);
        fs.rmSync(RESTORE_TMP, { recursive: true, force: true });
        fs.mkdirSync(RESTORE_TMP, { recursive: true });
        zip.extractAllTo(RESTORE_TMP, true);
        console.log("✅ ZIP extrait avec succès");

        // 4. Vérifier la structure du backup
        const dbPath = path.join(RESTORE_TMP, "database");
        const uploadsPath = path.join(RESTORE_TMP, "uploads");
        const metaPath = path.join(RESTORE_TMP, "meta.json");

        if (!fs.existsSync(dbPath)) {
            throw new Error("Structure de backup invalide: dossier 'database' manquant");
        }

        // Lire les métadonnées si disponibles
        let metadata = null;
        if (fs.existsSync(metaPath)) {
            metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            console.log("📋 Métadonnées du backup:", metadata);
        }

        // 5. Désactiver les contraintes de clés étrangères temporairement
        console.log("🔓 Désactivation des contraintes de clés étrangères...");
        await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

        // 6. Vider toutes les tables dans l'ordre inverse
        console.log("🗑️  Suppression des données existantes...");
        const reversedOrder = [...IMPORT_ORDER].reverse();

        for (const modelName of reversedOrder) {
            try {
                const tableName = getTableNameForDB(modelName);
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
                console.log(`   ✓ Table ${tableName} vidée`);
            } catch (error) {
                console.warn(`   ⚠️  Impossible de vider ${modelName}:`, (error as Error).message);
            }
        }

        // 7. Réinitialiser les séquences
        console.log("🔄 Réinitialisation des séquences...");
        try {
            const sequences = await prisma.$queryRawUnsafe<Array<{ sequencename: string }>>(`
                SELECT sequencename 
                FROM pg_sequences 
                WHERE schemaname = 'public';
            `);

            for (const seq of sequences) {
                try {
                    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${seq.sequencename}" RESTART WITH 1;`);
                } catch (error) {
                    console.warn(`   ⚠️  Impossible de réinitialiser ${seq.sequencename}`);
                }
            }
        } catch (error) {
            console.warn("⚠️  Erreur lors de la réinitialisation des séquences");
        }

        // 8. Import des données CSV dans l'ordre STRICT
        console.log("📥 Import des données (ordre respecté)...");
        let importedTables = 0;
        let totalRecords = 0;
        const errors: Array<{ table: string; error: string; record?: any }> = [];

        for (const modelName of IMPORT_ORDER) {
            const fileName = `${modelName}.csv`;
            const filePath = path.join(dbPath, fileName);

            if (!fs.existsSync(filePath)) {
                console.log(`   ⚠️  ${fileName} non trouvé - ignoré`);
                continue;
            }

            console.log(`   📄 Import de ${fileName}...`);

            // Initialiser le set d'IDs valides pour ce modèle
            validIds[modelName] = new Set<string>();

            const rows: any[] = [];

            // Lire le CSV
            await new Promise<void>((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on("data", (data: any) => {
                        rows.push(data);
                    })
                    .on("end", resolve)
                    .on("error", reject);
            });

            if (rows.length === 0) {
                console.log(`      ⚠️  ${fileName} vide - ignoré`);
                continue;
            }

            // Insérer les données
            let inserted = 0;
            let failed = 0;
            let skipped = 0;

            for (const row of rows) {
                try {
                    let preparedData = prepareDataForInsert(row, modelName);

                    // Valider les clés étrangères obligatoires
                    if (!validateForeignKeys(preparedData, modelName)) {
                        skipped++;
                        continue;
                    }

                    // Nettoyer les relations optionnelles invalides
                    preparedData = cleanOptionalRelations(preparedData, modelName);

                    // @ts-ignore - Prisma types dynamiques
                    const created = await prisma[modelName].create({
                        data: preparedData
                    });

                    // Enregistrer l'ID comme valide
                    if (created.id) {
                        validIds[modelName].add(created.id);
                    }

                    inserted++;
                } catch (error) {
                    failed++;
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    // Logger seulement les 3 premières erreurs de chaque type
                    if (failed <= 3) {
                        console.error(`      ❌ Erreur insertion dans ${modelName}:`, errorMessage);
                        errors.push({
                            table: modelName,
                            error: errorMessage,
                            record: row.id || row.reference || 'unknown'
                        });
                    }
                }
            }

            const statusIcon = failed === 0 && skipped === 0 ? '✅' : '⚠️';
            let statusText = `${inserted}/${rows.length} enregistrements importés`;
            if (failed > 0) statusText += ` (${failed} échecs)`;
            if (skipped > 0) statusText += ` (${skipped} ignorés)`;

            console.log(`      ${statusIcon} ${statusText}`);

            if (inserted > 0) {
                importedTables++;
                totalRecords += inserted;
            }
        }

        // 9. Réactiver les contraintes de clés étrangères
        console.log("🔒 Réactivation des contraintes de clés étrangères...");
        await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);

        // 10. Restaurer les fichiers uploads
        console.log("📁 Restauration des fichiers uploads...");
        if (fs.existsSync(uploadsPath)) {
            if (fs.existsSync(UPLOAD_DIR)) {
                fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
                console.log("   🗑️  Ancien dossier uploads supprimé");
            }

            fs.cpSync(uploadsPath, UPLOAD_DIR, { recursive: true });

            const countFiles = (dir: string): number => {
                let count = 0;
                try {
                    const items = fs.readdirSync(dir);
                    for (const item of items) {
                        const fullPath = path.join(dir, item);
                        if (fs.statSync(fullPath).isDirectory()) {
                            count += countFiles(fullPath);
                        } else {
                            count++;
                        }
                    }
                } catch (error) {
                    console.warn("Erreur comptage fichiers:", error);
                }
                return count;
            };

            const filesCount = countFiles(UPLOAD_DIR);
            console.log(`   ✅ ${filesCount} fichiers restaurés`);
        } else {
            console.log("   ⚠️  Aucun dossier uploads dans le backup");
        }

        // 11. Nettoyer les fichiers temporaires
        console.log("🧹 Nettoyage des fichiers temporaires...");
        fs.rmSync(RESTORE_TMP, { recursive: true, force: true });
        fs.rmSync(tmpZipPath, { force: true });

        console.log("✅ Restauration terminée!");

        return NextResponse.json({
            status: "success",
            message: errors.length > 0
                ? `Restauration terminée avec ${errors.length} avertissement(s)`
                : "Restauration terminée avec succès",
            details: {
                tablesImported: importedTables,
                totalRecords: totalRecords,
                backupDate: metadata?.createdAt || "Inconnue",
                restoredAt: new Date().toISOString(),
                errors: errors.length > 0 ? errors.slice(0, 10) : undefined
            }
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur critique import backup:", error);

        try {
            await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);
        } catch (e) {
            console.error("Erreur lors de la réactivation des contraintes:", e);
        }

        try {
            fs.rmSync(RESTORE_TMP, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error("Erreur lors du nettoyage:", cleanupError);
        }

        return NextResponse.json({
            status: "error",
            message: "Impossible de restaurer le backup.",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        }, { status: 500 });
    }
}