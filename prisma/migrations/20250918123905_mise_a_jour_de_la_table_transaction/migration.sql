/*
  Warnings:

  - The `reference` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."Transaction_reference_key";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "reference",
ADD COLUMN     "reference" SERIAL NOT NULL;
