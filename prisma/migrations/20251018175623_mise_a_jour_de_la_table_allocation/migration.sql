/*
  Warnings:

  - You are about to drop the column `allocationId` on the `allocation` table. All the data in the column will be lost.
  - Added the required column `natureId` to the `allocation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."allocation" DROP CONSTRAINT "allocation_allocationId_fkey";

-- AlterTable
ALTER TABLE "allocation" DROP COLUMN "allocationId",
ADD COLUMN     "natureId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
