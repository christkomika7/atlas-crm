/*
  Warnings:

  - You are about to drop the column `referenceDocument` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `referenceDocumentId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `_SourceToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_SourceToTransaction" DROP CONSTRAINT "_SourceToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SourceToTransaction" DROP CONSTRAINT "_SourceToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "referenceDocument",
DROP COLUMN "referenceDocumentId",
ADD COLUMN     "referenceInvoiceId" TEXT,
ADD COLUMN     "sourceId" TEXT;

-- DropTable
DROP TABLE "public"."_SourceToTransaction";

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "public"."invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
