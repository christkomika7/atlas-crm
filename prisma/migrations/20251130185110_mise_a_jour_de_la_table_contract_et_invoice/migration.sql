/*
  Warnings:

  - You are about to drop the column `contractId` on the `invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_contractId_fkey";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "contractId";

-- CreateTable
CREATE TABLE "_ContractToInvoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContractToInvoice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ContractToInvoice_B_index" ON "_ContractToInvoice"("B");

-- AddForeignKey
ALTER TABLE "_ContractToInvoice" ADD CONSTRAINT "_ContractToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES "contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContractToInvoice" ADD CONSTRAINT "_ContractToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
