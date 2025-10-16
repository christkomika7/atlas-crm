/*
  Warnings:

  - The `paidAmount` column on the `supplier` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `due` column on the `supplier` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "supplier" DROP COLUMN "paidAmount",
ADD COLUMN     "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "due",
ADD COLUMN     "due" DECIMAL(15,2) NOT NULL DEFAULT 0;
