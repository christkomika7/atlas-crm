/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_allocationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_natureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_payOnBehalfOfId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_referenceInvoiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_sourceId_fkey";

-- DropTable
DROP TABLE "public"."Transaction";

-- CreateTable
CREATE TABLE "public"."receipt" (
    "id" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL DEFAULT 'RECEIPT',
    "reference" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "movement" "public"."BankTransaction" NOT NULL DEFAULT 'INFLOWS',
    "categoryId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "amountType" "public"."AmountType" NOT NULL DEFAULT 'HT',
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "referenceInvoiceId" TEXT,
    "sourceId" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dibursement" (
    "id" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL DEFAULT 'DISBURSEMENT',
    "reference" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "movement" "public"."BankTransaction" NOT NULL DEFAULT 'OUTFLOWS',
    "categoryId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "amountType" "public"."AmountType" NOT NULL DEFAULT 'HT',
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "referenceInvoiceId" TEXT,
    "allocationId" TEXT,
    "sourceId" TEXT,
    "payOnBehalfOfId" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dibursement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "public"."transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "public"."invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "public"."transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "public"."invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."allocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_payOnBehalfOfId_fkey" FOREIGN KEY ("payOnBehalfOfId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dibursement" ADD CONSTRAINT "dibursement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
