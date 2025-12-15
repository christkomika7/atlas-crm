import { LocationBillboardDateType } from "@/stores/item.store";
import { RentalPeriodType } from "@/types/data.type";
import { Sale } from "@/types/item.type";
import { isWithinInterval, parse, startOfDay, addDays as addDaysFNS, differenceInDays, isAfter, isBefore, format, addMonths, addYears } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { paymentTerms } from "./data";

type DateRange = {
    startDate?: Date;
    endDate?: Date;
};


export function formatDateToDashModel(date: Date): string {
    return new Date(date).toLocaleDateString();
}

export function addDays(
    date: Date,
    days: number,
    returnType: "date" | "string" = "string"
): Date | string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);

    if (returnType === "date") {
        return result;
    }

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

export function checkDeadline(range: [Date, Date]) {
    const [start, end] = range;
    const now = new Date();

    const daysLeft = differenceInDays(end, now);

    const isOutside = isBefore(now, start) || isAfter(now, end);

    return { daysLeft, isOutside };
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

export function durationInMonths(start: Date, end: Date): number {
    const s = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
    const e = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

    if (e < s) return 0;

    let months = (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth());

    const candidate = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + months, s.getUTCDate()));

    if (candidate > e) {
        months -= 1;
    }

    const reference = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + months, s.getUTCDate()));

    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = Math.round((e.getTime() - reference.getTime()) / msPerDay);

    let extra = 0;
    if (dayDiff > 0) {
        extra = dayDiff <= 15 ? 0.5 : 1;
    }

    return months + extra;
}


export function getEnableDate(
    locations: LocationBillboardDateType[],
    billboardId: string,
    invoiceId?: string,
    mode: "complete" | "semi" = "complete"
): Date {
    const disabledDateRanges: [Date, Date][] = mode === "complete" ?
        locations
            .filter(
                (billboard) =>
                    billboard.billboardReference === billboardId &&
                    !billboard.isNew &&
                    billboard.invoiceId !== invoiceId
            )
            .map((billboard) => [
                startOfDay(new Date(billboard.locationDate[0])),
                startOfDay(new Date(billboard.locationDate[1])),
            ]) :
        locations
            .filter(
                (billboard) =>
                    billboard.billboardReference === billboardId
            )
            .map((billboard) => [
                startOfDay(new Date(billboard.locationDate[0])),
                startOfDay(new Date(billboard.locationDate[1])),
            ]);

    let current = startOfDay(new Date());

    while (
        disabledDateRanges.some(([start, end]) =>
            isWithinInterval(current, { start, end })
        )
    ) {
        current = addDaysFNS(current, 1);
    }

    return current;
}

export function toUtcDateOnly(input: string | Date): Date {
    const raw =
        typeof input === "string" ? input.split("T")[0] : input instanceof Date ? input.toISOString().split("T")[0] : String(input);
    const [yStr, mStr, dStr] = raw.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return new Date();
    // crée une Date à minuit UTC pour éviter les décalages timezone lors de la sauvegarde
    return new Date(Date.UTC(y, m - 1, d));
};

export function toDateOnlyString(value?: string | Date | null) {
    if (!value) return "";
    if (value instanceof Date) {
        // formatte proprement une Date en YYYY-MM-DD
        return format(value, "yyyy-MM-dd");
    }
    const s = String(value).trim();
    // si déjà au format YYYY-MM-DD ou commence par YYYY-MM-DD, on garde la partie date
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    // fallback : essayer de parser et formatter (moins optimal mais utile pour d'autres formats)
    const d = new Date(s);
    if (!isNaN(d.getTime())) return format(d, "yyyy-MM-dd");
    return s;
}

export function getEndDate(start: Date, delay: RentalPeriodType) {
    switch (delay) {
        case "6_months":
            return addMonths(start, 6);
        case "1_year":
            return addYears(start, 1);
        case "2_years":
            return addYears(start, 2);
        case "3_years":
            return addYears(start, 3);
        case "5_years":
            return addYears(start, 5);
        default:
            return addMonths(start, 6);
    }
}

export function dueDate(invoiceDate: Date, due: string): { color: string; text: string; value: number } {
    const days = paymentTerms.find((p) => p.value === due)?.data ?? 0;
    const start = new Date(invoiceDate);
    const end = addDaysFNS(start, days);
    const status = checkDeadline([start, end]);
    if (status.isOutside) return {
        color: "text-red-600",
        text: "Expiré",
        value: 0
    }
    return {
        color: 'text-green-600',
        text: `${status.daysLeft} jour${status.daysLeft > 1 ? 's' : ''}`,
        value: status.daysLeft
    }
}