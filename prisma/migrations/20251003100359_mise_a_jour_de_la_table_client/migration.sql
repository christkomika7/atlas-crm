/*
  Warnings:

  - The `paidAmount` column on the `client` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `due` column on the `client` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "client" DROP COLUMN "paidAmount",
ADD COLUMN     "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
DROP COLUMN "due",
ADD COLUMN     "due" DECIMAL(10,2) NOT NULL DEFAULT 0;
