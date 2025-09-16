import { ClientType } from "./client.types";
import { CompanyType } from "./company.types";

export type AppointmentType = {
    id: string;
    email: string;
    date: Date;
    path: string;
    time: string;
    subject: string;
    address: string;
    teamMemberName: string;
    documents: string[];
    companyId: string;
    clientId: string;
    teamMemberId: string;
    company: CompanyType<string>;
    client: ClientType
}