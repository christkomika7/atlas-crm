/*
  Warnings:

  - You are about to drop the column `photos` on the `invoice` table. All the data in the column will be lost.
  - Added the required column `paymentLimit` to the `invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."invoice" DROP COLUMN "photos",
ADD COLUMN     "paymentLimit" TEXT NOT NULL;
