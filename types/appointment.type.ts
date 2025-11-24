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
    company: CompanyType;
    client: ClientType
}

export type GetAppointmentsParams = {
    companyId: string;
    type: "upcoming" | "past";
    skip?: number;
    take?: number;
    [k: string]: any;
};


export type SortField =
    | "byDate"
    | "byClient"
    | "byEmail"
    | "byTime"
    | "byAddress"
    | "bySubject"
    | "byTeamMember";