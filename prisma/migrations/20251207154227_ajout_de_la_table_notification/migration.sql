-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'CONFIRM');

-- CreateEnum
CREATE TYPE "NotificationKindOf" AS ENUM ('INVOICE', 'PURCHASE_ORDER', 'QUOTE', 'PAYMENT', 'DELIVERY_NOTE', 'RECEIPT', 'DISBURSEMENT', 'APPOINTMENT', 'PROJECT', 'TASK');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ALERT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "for" "NotificationKindOf" NOT NULL,
    "paymentId" TEXT,
    "receiptId" TEXT,
    "dibursementId" TEXT,
    "invoiceId" TEXT,
    "quoteId" TEXT,
    "deliveryNoteId" TEXT,
    "purchaseOrderId" TEXT,
    "appointmentId" TEXT,
    "projectId" TEXT,
    "taskId" TEXT,
    "userId" TEXT,
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_data" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL,
    "infos" TEXT,
    "invoice" TEXT,
    "purchaseOrder" TEXT,

    CONSTRAINT "payment_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_data" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountType" "AmountType" NOT NULL DEFAULT 'HT',
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT,
    "invoice" TEXT,
    "source" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "client" TEXT,
    "supplier" TEXT,

    CONSTRAINT "receipt_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dibursement_data" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountType" "AmountType" NOT NULL DEFAULT 'HT',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT,
    "purchaseOrder" TEXT,
    "allocation" TEXT,
    "source" TEXT,
    "payOnBehalfOf" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "client" TEXT,
    "supplier" TEXT,
    "project" TEXT,
    "fiscalObject" TEXT,

    CONSTRAINT "dibursement_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipt_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_dibursementId_fkey" FOREIGN KEY ("dibursementId") REFERENCES "dibursement_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
