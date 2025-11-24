import { $Enums, Action, Resource } from "@/lib/generated/prisma";
import { CompanyType } from "./company.types";

// export type ProfileType<F = string> = {
//     id: string;
//     createdAt: Date;
//     updatedAt: Date;
//     lastname: string;
//     firstname: string;
//     phone: string | null;
//     job: string;
//     salary: string;
//     userId: string;
//     key: string;
//     internalRegulations: F | null;
//     passport: F | null;
// }

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
    | "contract"
    | "transaction"
    | "setting";

export type PermissionType = {
    id: string;
    actions: Action[];
    resource: Resource;
}



export type UserType = {
    id: string;
    role: $Enums.Role | null;
    email: string;
    name: string;
    currentCompany: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    profiles: ProfileType[]
}


export type ProfileType = {
    id: string;
    role: $Enums.Role | null;
    key: number;
    firstname: string;
    lastname: string;
    image: string | null;
    path: string | null;
    phone: string | null;
    job: string;
    salary: string;
    internalRegulations: string | null;
    passport: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
    companyId: string | null;
    permissions: PermissionType[]
    userId: string;
    user: UserType;
    company: CompanyType;
    createdAt: Date;
    updatedAt: Date;
}