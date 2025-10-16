/*
  Warnings:

  - You are about to drop the column `deliveryNotesId` on the `quote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."quote" DROP CONSTRAINT "quote_deliveryNotesId_fkey";

-- AlterTable
ALTER TABLE "quote" DROP COLUMN "deliveryNotesId";
