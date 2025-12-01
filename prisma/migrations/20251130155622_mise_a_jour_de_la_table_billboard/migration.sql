/*
  Warnings:

  - You are about to drop the column `rentalEndDate` on the `billboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "rentalEndDate",
ADD COLUMN     "delayContractEnd" TIMESTAMP(3),
ADD COLUMN     "delayContractStart" TIMESTAMP(3);
