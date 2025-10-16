/*
  Warnings:

  - You are about to drop the column `invoiceNumber` on the `purchase_order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchase_order" DROP COLUMN "invoiceNumber",
ADD COLUMN     "purchaseOrderNumber" SERIAL NOT NULL;
