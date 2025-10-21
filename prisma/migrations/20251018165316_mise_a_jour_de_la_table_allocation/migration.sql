/*
  Warnings:

  - Added the required column `allocationId` to the `allocation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CHECK', 'CASH', 'BANK_TRANSFERT');

-- AlterTable
ALTER TABLE "allocation" ADD COLUMN     "allocationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "source" ADD COLUMN     "sourceType" "SourceType" NOT NULL DEFAULT 'CHECK';

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
