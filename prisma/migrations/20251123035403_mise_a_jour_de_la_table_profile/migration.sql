/*
  Warnings:

  - Made the column `path` on table `profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "profile" ALTER COLUMN "path" SET NOT NULL,
ALTER COLUMN "path" SET DEFAULT '';
