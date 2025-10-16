/*
  Warnings:

  - You are about to drop the column `locationEnd` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `locationStart` on the `billboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."billboard" DROP COLUMN "locationEnd",
DROP COLUMN "locationStart";
