/*
  Warnings:

  - You are about to drop the column `placementId` on the `billboard` table. All the data in the column will be lost.
  - Added the required column `areaId` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placement` to the `billboard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."billboard" DROP CONSTRAINT "billboard_placementId_fkey";

-- AlterTable
ALTER TABLE "public"."billboard" DROP COLUMN "placementId",
ADD COLUMN     "areaId" TEXT NOT NULL,
ADD COLUMN     "placement" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
