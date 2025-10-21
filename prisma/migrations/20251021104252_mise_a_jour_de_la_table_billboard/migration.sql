/*
  Warnings:

  - You are about to drop the column `contractEnd` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `contractStart` on the `billboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "contractEnd",
DROP COLUMN "contractStart",
ADD COLUMN     "rentalStartDate" TIMESTAMP(3);
