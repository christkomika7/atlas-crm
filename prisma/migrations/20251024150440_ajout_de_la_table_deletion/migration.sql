-- CreateEnum
CREATE TYPE "DeletionType" AS ENUM ('QUOTES', 'INVOICES', 'DELIVERY_NOTES', 'PURCHASE_ORDERS', 'RECEIPTS', 'DISBURSEMENTS', 'PRODUCT_SERVICES', 'BILLBOARDS', 'CLIENTS', 'SUPPLIERS');

-- CreateTable
CREATE TABLE "deletion" (
    "id" TEXT NOT NULL,
    "type" "DeletionType" NOT NULL,
    "ids" TEXT[],
    "isValidate" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deletion_pkey" PRIMARY KEY ("id")
);
