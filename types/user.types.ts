import { $Enums, Action, Resource } from "@/lib/generated/prisma";
import { Decimal } from "decimal.js";

export type ProfileType<F = string> = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastname: string;
    firstname: string;
    phone: string | null;
    job: string;
    salary: string;
    userId: string;
    key: string;
    internalRegulations: F | null;
    passport: F | null;
}

export type ResourceType =
    | "dashboard"
    | "clients"
    | "suppliers"
    | "invoices"
    | "quotes"
    | "deliveryNotes"
    | "purchaseOrder"
    | "creditNotes"
    | "productServices"
    | "billboards"
    | "projects"
    | "appointment"
    | "transaction"
    | "setting";

export type PermissionType = {
    id: string;
    actions: Action[];
    resource: Resource;
}



export type UserType<F = string> = {
    id: string;
    key: number;
    name: string;
    email: string;
    role: $Enums.Role | null;
    emailVerified: boolean;
    image: F | null;
    path: string | null;
    createdAt: Date;
    updatedAt: Date;
    companyId: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    profile: ProfileType<F>;
    permissions: PermissionType[]
}
