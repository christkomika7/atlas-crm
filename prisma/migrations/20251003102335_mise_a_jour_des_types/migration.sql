/*
  Warnings:

  - The `revenueGenerate` column on the `billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `balance` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "revenueGenerate",
ADD COLUMN     "revenueGenerate" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "client" ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "due" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "project" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "balance",
ADD COLUMN     "balance" DECIMAL(15,2) NOT NULL DEFAULT 0;
