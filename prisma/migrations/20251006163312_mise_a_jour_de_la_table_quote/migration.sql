/*
  Warnings:

  - You are about to drop the `_ItemToQuote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ItemToQuote" DROP CONSTRAINT "_ItemToQuote_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ItemToQuote" DROP CONSTRAINT "_ItemToQuote_B_fkey";

-- AlterTable
ALTER TABLE "item" ADD COLUMN     "quoteId" TEXT;

-- DropTable
DROP TABLE "public"."_ItemToQuote";

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
