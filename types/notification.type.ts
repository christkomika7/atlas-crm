import { $Enums } from "@/lib/generated/prisma";
import { TransactionType } from "./transaction.type";
import { InvoiceType } from "./invoice.types";
import { QuoteType } from "./quote.types";
import { DeliveryNoteType } from "./delivery-note.types";
import { PurchaseOrderType } from "./purchase-order.types";
import { AppointmentType } from "./appointment.type";
import { ProjectType } from "./project.types";
import { TaskType } from "./task.type";
import { CompanyType } from "./company.types";
import { UserType } from "./user.types";

export type NotificationType = {
    id: string;
    type: $Enums.NotificationType;
    active: boolean;
    for: $Enums.NotificationKindOf;
    message?: string;

    paymentDibursementId?: string;
    paymentDibursement?: TransactionType;

    receiptId?: string;
    receipt?: TransactionType;

    dibursementId?: string;

    invoiceId?: string;
    invoice?: InvoiceType;

    quoteId?: string;
    quote?: QuoteType;

    deliveryNoteId?: string;
    deliveryNote?: DeliveryNoteType;

    purchaseOrderId?: string;
    purchaseOrder?: PurchaseOrderType;

    appointmentId?: string;
    appointment?: AppointmentType;

    projectId?: string;
    project?: ProjectType;

    taskId?: string;
    task?: TaskType;

    readBy: NotificationReadType[];

    companyId: string;
    company: CompanyType;

    updatedAt: Date;
    createdAt: Date;
};



type NotificationReadType = {
    id: string;
    readAt: Date;
    user: UserType
}
