import { $Enums } from "@/lib/generated/prisma";

export type DeletionType = {
    id: string;
    recordId: string;
    reference: string;
    date: Date;
    forUser?: string;
    amount?: string;
    due?: string;
    categorie?: string;
    designation?: string;
    price?: string;
}