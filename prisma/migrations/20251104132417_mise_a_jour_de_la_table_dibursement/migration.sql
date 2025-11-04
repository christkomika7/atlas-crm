/*
  Warnings:

  - You are about to drop the column `period` on the `dibursement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dibursement" DROP COLUMN "period",
ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3);
