/*
  Warnings:

  - Added the required column `companyId` to the `deletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deletion" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "deletion" ADD CONSTRAINT "deletion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
