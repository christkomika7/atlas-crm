import { ClientType } from "./client.types";
import { CompanyType } from "./company.types";
import { UserType } from "./user.types";

export type ProjectType = {
    id: string;
    name: string
    deadline: Date;
    projectInformation: string;
    amount: string;
    balance: string;
    path: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
    files: string[];
    photos: string[];
    collaborators: UserType[];
    company: CompanyType;
    client: ClientType
}