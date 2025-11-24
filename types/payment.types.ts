import Decimal from "decimal.js";

export type PaymentType = {
    id: string;
    amount: Decimal;
    paymentMode: string;
    infos: string | null;
    invoiceId: string | null;
    purchaseOrderId: string | null;
    updatedAt: Date;
    createdAt: Date;
}
