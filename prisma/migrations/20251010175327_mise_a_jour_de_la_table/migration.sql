/*
  Warnings:

  - You are about to drop the `_DeliveryNoteToQuote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_InvoiceToQuote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_DeliveryNoteToQuote" DROP CONSTRAINT "_DeliveryNoteToQuote_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DeliveryNoteToQuote" DROP CONSTRAINT "_DeliveryNoteToQuote_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_InvoiceToQuote" DROP CONSTRAINT "_InvoiceToQuote_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_InvoiceToQuote" DROP CONSTRAINT "_InvoiceToQuote_B_fkey";

-- AlterTable
ALTER TABLE "delivery_note" ADD COLUMN     "fromRecordId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "fromRecordId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordReference" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "deliveryNotesId" TEXT,
ADD COLUMN     "fromRecordId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromRecordReference" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "public"."_DeliveryNoteToQuote";

-- DropTable
DROP TABLE "public"."_InvoiceToQuote";

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_deliveryNotesId_fkey" FOREIGN KEY ("deliveryNotesId") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
