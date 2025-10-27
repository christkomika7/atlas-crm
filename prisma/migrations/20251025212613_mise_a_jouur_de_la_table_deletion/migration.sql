/*
  Warnings:

  - You are about to drop the column `ids` on the `deletion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recordId]` on the table `deletion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `recordId` to the `deletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deletion" DROP COLUMN "ids",
ADD COLUMN     "recordId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "deletion_recordId_key" ON "deletion"("recordId");
