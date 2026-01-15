import { TransactionType } from "@/types/transaction.type";
import ExcelJS from "exceljs";
import { formatDateToDashModel, period } from "./date";
import { formatNumber, getPaymentModeLabel } from "./utils";

export async function generateTransactionsExcel(
    transactions: TransactionType[],
    companyName: string,
    currency: string,
    currentDate: string
) {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Transactions", {
        pageSetup: { orientation: "landscape", paperSize: 9 }
    });

    // ✅ DÉFINIR UNIQUEMENT LES LARGEURS (pas les headers)
    const columns = [
        { key: "date", width: 15 },
        { key: "movement", width: 10 },
        { key: "category", width: 20 },
        { key: "nature", width: 20 },
        { key: "description", width: 30 },
        { key: "htAmount", width: 15 },
        { key: "ttcAmount", width: 15 },
        { key: "paymentType", width: 20 },
        { key: "checkNumber", width: 20 },
        { key: "documentReference", width: 25 },
        { key: "allocation", width: 20 },
        { key: "source", width: 20 },
        { key: "period", width: 20 },
        { key: "paidFor", width: 25 },
        { key: "payer", width: 25 },
        { key: "comment", width: 30 },
    ];

    sheet.columns = columns;

    // ✅ AJOUTER LES EN-TÊTES PERSONNALISÉS
    const companyRow = sheet.addRow([companyName]);
    companyRow.font = { name: "Helvetica", bold: true, size: 16 };
    companyRow.alignment = { vertical: "middle", horizontal: "center" };
    sheet.mergeCells(`A${companyRow.number}:P${companyRow.number}`);

    const journalRow = sheet.addRow(["Journal des transactions"]);
    journalRow.font = { name: "Helvetica", bold: true, size: 20 };
    journalRow.alignment = { vertical: "middle", horizontal: "center" };
    sheet.mergeCells(`A${journalRow.number}:P${journalRow.number}`);

    const dateRow = sheet.addRow([currentDate]);
    dateRow.font = { name: "Helvetica", size: 14 };
    dateRow.alignment = { vertical: "middle", horizontal: "center" };
    sheet.mergeCells(`A${dateRow.number}:P${dateRow.number}`);

    sheet.addRow([]);

    // ✅ AJOUTER LA LIGNE D'EN-TÊTE DES COLONNES
    const headerLabels = [
        "Date", "Mouvement", "Catégorie", "Nature", "Description",
        "HT Montant", "TTC Montant", "Mode de paiement", "Numéro de chèque",
        "Référence du document", "Allocation", "Source", "Période",
        "Payé pour le compte de", "Payeur", "Commentaire"
    ];

    const headerRow = sheet.addRow(headerLabels);
    headerRow.font = { name: "Helvetica", bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

    headerRow.eachCell((cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    transactions.forEach((tx) => {
        const row = sheet.addRow({
            date: formatDateToDashModel(new Date(tx.date)),
            movement: tx.movement === "INFLOWS" ? "Entrée" : "Sortie",
            category: tx.category?.name || "-",
            nature: tx.nature?.name || "-",
            description: tx.description || "-",
            htAmount: tx.amountType === "HT" ? `${formatNumber(tx.amount)} ${currency}` : "-",
            ttcAmount: tx.amountType === "TTC" ? `${formatNumber(tx.amount)} ${currency}` : "-",
            paymentType: getPaymentModeLabel(tx.paymentType),
            checkNumber: tx.checkNumber || "-",
            documentReference: tx.documentReference || "-",
            allocation: tx.allocation?.name || "-",
            source: tx.source?.name || "-",
            period: period(tx.periodStart, tx.periodEnd),
            paidFor: tx.payOnBehalfOf ? `${tx.payOnBehalfOf.lastname} ${tx.payOnBehalfOf.firstname}` : "-",
            payer: tx.client
                ? `${tx.client.lastname} ${tx.client.firstname}`
                : tx.payOnBehalfOf
                    ? `${tx.payOnBehalfOf.lastname} ${tx.payOnBehalfOf.firstname}`
                    : "-",
            comment: tx.comment || "-",
        });

        row.eachCell((cell) => {
            cell.font = { name: "Helvetica" };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
    });

    sheet.eachRow({ includeEmpty: true }, (row) => {
        row.height = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}