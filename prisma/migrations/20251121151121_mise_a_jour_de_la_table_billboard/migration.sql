/*
  Warnings:

  - You are about to drop the column `address` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `billboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "address",
DROP COLUMN "zone";
