/*
  Warnings:

  - The `period` column on the `dibursement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "dibursement" DROP COLUMN "period",
ADD COLUMN     "period" TIMESTAMP(3);
