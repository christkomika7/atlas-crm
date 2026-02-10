import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { createObjectCsvWriter } from "csv-writer";
import { checkAccess } from "@/lib/access";
import prisma from '@/lib/prisma';

const UPLOAD_DIR = path.join(process.cwd(), "upload");
const BACKUP_TMP = path.join(process.cwd(), "tmp/backup");

// Fonction pour convertir les données Prisma en format CSV compatible
function prepareDataForCSV(data: any[]): any[] {
    return data.map(record => {
        const prepared: any = {};
        for (const [key, value] of Object.entries(record)) {
            if (value === null || value === undefined) {
                prepared[key] = '';
            } else if (value instanceof Date) {
                prepared[key] = value.toISOString();
            } else if (typeof value === 'object') {
                // Convertir les objets JSON et arrays en string
                prepared[key] = JSON.stringify(value);
            } else if (typeof value === 'bigint') {
                prepared[key] = value.toString();
            } else {
                prepared[key] = value;
            }
        }
        return prepared;
    });
}

export async function GET(req: NextRequest) {
    console.log("Début export backup");
    const auth = await checkAccess("SETTING", "READ");
    if (!auth.authorized) {
        return NextResponse.json({
            status: "error",
            message: auth.message,
        }, { status: 403 });
    }

    try {
        // Nettoyer et créer les répertoires temporaires
        fs.rmSync(BACKUP_TMP, { recursive: true, force: true });
        fs.mkdirSync(BACKUP_TMP, { recursive: true });
        fs.mkdirSync(`${BACKUP_TMP}/database`, { recursive: true });

        // Liste complète des tables à exporter (basée sur votre schéma Prisma)
        const models: (keyof typeof prisma)[] = [
            "company",
            "user",
            "profile",
            "supplier",
            "client",
            "appointment",
            "contract",
            "billboard",
            "invoice",
            "purchaseOrder",
            "quote",
            "deliveryNote",
            "recurrence",
            "payment",
            "item",
            "project",
            "task",
            "taskStep",
            "city",
            "area",
            "billboardType",
            "displayBoard",
            "structureType",
            "lessorType",
            "documentModel",
            "receipt",
            "dibursement",
            "source",
            "fiscalObject",
            "transactionCategory",
            "transactionNature",
            "userAction",
            "deletion",
            "notification",
            "notificationRead",
            "dibursementData",
            "permission",
            "session",
            "account",
            "verification",
            "rateLimit",
            "productService"
        ];

        let exportedTables = 0;
        let totalRecords = 0;

        // Export de chaque table
        for (const model of models) {
            try {
                console.log(`Export de la table: ${String(model)}`);

                // @ts-ignore - Prisma types dynamiques
                const data = await prisma[model].findMany();

                if (!data || data.length === 0) {
                    console.log(`⚠️  Table ${String(model)} vide - ignorée`);
                    continue;
                }

                // Préparer les données pour le CSV
                const preparedData = prepareDataForCSV(data);

                // Créer les en-têtes du CSV
                const headers = Object.keys(preparedData[0]).map(k => ({
                    id: k,
                    title: k
                }));

                // Créer le fichier CSV
                const csvPath = `${BACKUP_TMP}/database/${String(model)}.csv`;
                const writer = createObjectCsvWriter({
                    path: csvPath,
                    header: headers,
                    encoding: 'utf8'
                });

                await writer.writeRecords(preparedData);

                exportedTables++;
                totalRecords += data.length;
                console.log(`✅ Table ${String(model)}: ${data.length} enregistrements exportés`);

            } catch (modelError) {
                console.error(`❌ Erreur lors de l'export de ${String(model)}:`, modelError);
                // Continuer avec les autres tables même si une échoue
            }
        }

        // Créer un fichier de métadonnées
        const metadata = {
            createdAt: new Date().toISOString(),
            app: "atlas-crm",
            version: "1.0",
            tablesExported: exportedTables,
            totalRecords: totalRecords,
            tables: models.map(m => String(m))
        };

        fs.writeFileSync(
            `${BACKUP_TMP}/meta.json`,
            JSON.stringify(metadata, null, 2)
        );

        // Créer un README pour expliquer la structure du backup
        const readmeContent = `# Backup Atlas CRM

Créé le: ${new Date().toISOString()}

## Structure du backup

- **database/** : Contient tous les exports CSV de la base de données
- **uploads/** : Contient tous les fichiers uploadés par les utilisateurs
- **meta.json** : Métadonnées du backup

## Tables exportées (${exportedTables})

${models.map(m => `- ${String(m)}.csv`).join('\n')}

## Total d'enregistrements: ${totalRecords}

## Restauration

Pour restaurer ce backup:
1. Importer les fichiers CSV dans une base de données PostgreSQL
2. Copier le dossier uploads/ vers le répertoire de l'application
3. Vérifier l'intégrité des données avec meta.json
`;

        fs.writeFileSync(`${BACKUP_TMP}/README.md`, readmeContent);

        // Créer l'archive ZIP
        console.log("Création de l'archive ZIP...");
        const zipPath = path.join(process.cwd(), "backup.zip");

        // Supprimer l'ancien backup s'il existe
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 } // Compression maximale
        });

        // Gestion des erreurs de l'archive
        archive.on('error', (err) => {
            throw err;
        });

        // Gestion de la fermeture de l'archive
        await new Promise<void>((resolve, reject) => {
            output.on('close', () => {
                console.log(`Archive créée: ${archive.pointer()} bytes`);
                resolve();
            });

            output.on('error', reject);
            archive.on('error', reject);

            archive.pipe(output);

            // Ajouter le contenu du backup temporaire
            archive.directory(BACKUP_TMP, false);

            // Ajouter les fichiers uploads s'ils existent
            if (fs.existsSync(UPLOAD_DIR)) {
                archive.directory(UPLOAD_DIR, "uploads");
                console.log("Fichiers uploads ajoutés à l'archive");
            } else {
                console.log("⚠️  Répertoire uploads introuvable");
            }

            archive.finalize();
        });

        // Nettoyer les fichiers temporaires
        console.log("Nettoyage des fichiers temporaires...");
        fs.rmSync(BACKUP_TMP, { recursive: true, force: true });

        const stats = fs.statSync(zipPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log("✅ Backup créé avec succès");

        return NextResponse.json({
            status: "success",
            message: "Backup créé avec succès.",
            downloadPath: "/backup.zip",
            details: {
                tablesExported: exportedTables,
                totalRecords: totalRecords,
                fileSize: `${fileSizeMB} MB`,
                createdAt: new Date().toISOString()
            }
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Erreur export backup:", error);

        // Nettoyer en cas d'erreur
        try {
            fs.rmSync(BACKUP_TMP, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error("Erreur lors du nettoyage:", cleanupError);
        }

        return NextResponse.json({
            status: "error",
            message: "Impossible de créer le backup.",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        }, { status: 500 });
    }
}