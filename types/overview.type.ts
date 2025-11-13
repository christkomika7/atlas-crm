import Decimal from "decimal.js";

export type RecordType = {
    id: string;
    type: string
    reference: string;
    company: string;
    forUser: string;
    amountPaid: Decimal;
    amountUnpaid: Decimal;
    status: string;
}