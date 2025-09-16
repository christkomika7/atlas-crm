import { Sale } from "@/types/item.type";
import { parse } from "date-fns";
import { fr } from "date-fns/locale/fr";

type DateRange = {
    startDate?: Date;
    endDate?: Date;
};

export function formatDateToDashModel(date: Date): string {
    return new Date(date).toLocaleDateString().replaceAll("/", "-");
}

export function addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);

    return formatDateToDashModel(result);
}

export function parseDateTime(
    dateStr: string,  // format "dd/MM/yyyy"
    hour: number,
    minute: number
): Date {
    const baseDate = parse(dateStr, "dd/MM/yyyy", new Date(), { locale: fr });
    const finalDate = new Date(baseDate);

    finalDate.setHours(hour, minute, 0, 0);

    // Corriger le décalage de fuseau horaire si nécessaire
    const timezoneOffset = finalDate.getTimezoneOffset();
    if (timezoneOffset !== 0) {
        finalDate.setMinutes(finalDate.getMinutes() - timezoneOffset);
    }

    return finalDate;
}

export function getCurrentDateTime(): Date {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const correctedDate = new Date(now.getTime() - (timezoneOffset * 60 * 1000));

    return correctedDate;
}

export function getDateStatus(range: DateRange): "green" | "yellow" | "red" {
    let { startDate, endDate } = range;

    if (!startDate || !endDate) return "green";

    // Convertir en Date si ce n'est pas déjà une Date
    if (!(startDate instanceof Date)) startDate = new Date(startDate);
    if (!(endDate instanceof Date)) endDate = new Date(endDate);

    const now = new Date();

    // Red : entre startDate et endDate inclus
    if (now >= startDate && now <= endDate) return "red";

    // Fenêtre yellow : 10 jours avant startDate et 10 jours après endDate
    const tenDaysBeforeStart = new Date(startDate);
    tenDaysBeforeStart.setDate(startDate.getDate() - 10);

    const tenDaysAfterEnd = new Date(endDate);
    tenDaysAfterEnd.setDate(endDate.getDate() + 10);

    // Yellow avant startDate (exclu)
    if (now >= tenDaysBeforeStart && now < startDate) return "yellow";

    // Yellow après endDate (exclu)
    if (now > endDate && now <= tenDaysAfterEnd) return "yellow";

    // Sinon green
    return "green";
}

export function getMonthsAndDaysDifference(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let yearsDiff = end.getFullYear() - start.getFullYear();
    let monthsDiff = end.getMonth() - start.getMonth();
    let daysDiff = end.getDate() - start.getDate();

    // Ajustement des jours si négatif
    if (daysDiff < 0) {
        monthsDiff -= 1;
        const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        daysDiff += previousMonth.getDate();
    }

    // Ajustement des mois si négatif
    if (monthsDiff < 0) {
        monthsDiff += 12;
        yearsDiff -= 1;
    }

    // Normalisation : 12 mois = 1 an
    if (monthsDiff >= 12) {
        yearsDiff += Math.floor(monthsDiff / 12);
        monthsDiff = monthsDiff % 12;
    }

    // Construction du résultat
    const parts: string[] = [];
    if (yearsDiff > 0) parts.push(`${yearsDiff} an${yearsDiff > 1 ? "s" : ""}`);
    if (monthsDiff > 0) parts.push(`${monthsDiff} mois`);
    if (daysDiff > 0) parts.push(`${daysDiff} jour${daysDiff > 1 ? "s" : ""}`);

    return parts.join(" et ");
}

export function getTotalDuration(sales: Sale[]): string {
    // Somme totale des jours
    let totalDays = 0;

    for (const sale of sales) {
        const start = new Date(sale.startDate);
        const end = new Date(sale.endDate);

        // Différence en millisecondes → jours
        const diffTime = Math.max(0, end.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        totalDays += diffDays;
    }

    // Conversion : 1 mois = 30 jours, 1 an = 12 mois
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;

    // Construction de la chaîne
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} mois`);
    if (days > 0) parts.push(`${days} j`);

    return parts.join(" & ") || "0 j";
}
