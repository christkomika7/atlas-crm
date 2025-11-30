import { $Enums } from "@/lib/generated/prisma";

export type DeletionType = {
    id: string;
    recordId: string;
    reference: string;
    date: Date;
    actionBy?: string;
    forUser?: string;
    amount?: string;
    due?: string;
    categorie?: string;
    designation?: string;
    price?: string;
}