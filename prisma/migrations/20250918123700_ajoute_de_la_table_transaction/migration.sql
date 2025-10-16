-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('RECEIPT', 'DISBURSEMENT');

-- CreateEnum
CREATE TYPE "public"."BankTransaction" AS ENUM ('INFLOWS', 'OUTFLOWS');

-- CreateEnum
CREATE TYPE "public"."AmountType" AS ENUM ('HT', 'TTC');

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "type" "public"."TransactionType" NOT NULL DEFAULT 'RECEIPT',
    "reference" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "movement" "public"."BankTransaction" NOT NULL DEFAULT 'INFLOWS',
    "categoryId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "amountType" "public"."AmountType" NOT NULL DEFAULT 'HT',
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "referenceDocumentId" TEXT NOT NULL,
    "referenceDocument" TEXT NOT NULL,
    "allocationId" TEXT,
    "payOnBehalfOfId" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."allocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "transaction_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_nature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "transaction_nature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_SourceToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SourceToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "public"."Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "source_name_key" ON "public"."source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_name_key" ON "public"."allocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_category_name_key" ON "public"."transaction_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_nature_name_key" ON "public"."transaction_nature"("name");

-- CreateIndex
CREATE INDEX "_SourceToTransaction_B_index" ON "public"."_SourceToTransaction"("B");

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "public"."transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."allocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_payOnBehalfOfId_fkey" FOREIGN KEY ("payOnBehalfOfId") REFERENCES "public"."client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."source" ADD CONSTRAINT "source_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocation" ADD CONSTRAINT "allocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_category" ADD CONSTRAINT "transaction_category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_nature" ADD CONSTRAINT "transaction_nature_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_nature" ADD CONSTRAINT "transaction_nature_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SourceToTransaction" ADD CONSTRAINT "_SourceToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SourceToTransaction" ADD CONSTRAINT "_SourceToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
