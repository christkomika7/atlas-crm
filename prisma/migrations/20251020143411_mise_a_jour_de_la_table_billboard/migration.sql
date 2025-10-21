/*
  Warnings:

  - You are about to drop the column `brochureFiles` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `dimension` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `files` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `imageFiles` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `information` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `leasedSpace` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `lessorJob` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `lessorType` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `pathContract` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `pathFile` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `placement` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `representativeContract` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `representativeName` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `signedLeaseContract` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `structure` on the `billboard` table. All the data in the column will be lost.
  - You are about to drop the column `technicalVisibility` on the `billboard` table. All the data in the column will be lost.
  - Added the required column `displayBoardId` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `electricity` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `framework` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessorTypeId` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lighting` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locality` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panelCondition` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureTypeId` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visualMarker` to the `billboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `billboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "brochureFiles",
DROP COLUMN "dimension",
DROP COLUMN "files",
DROP COLUMN "imageFiles",
DROP COLUMN "information",
DROP COLUMN "leasedSpace",
DROP COLUMN "lessorJob",
DROP COLUMN "lessorType",
DROP COLUMN "pathContract",
DROP COLUMN "pathFile",
DROP COLUMN "paymentMethod",
DROP COLUMN "placement",
DROP COLUMN "representativeContract",
DROP COLUMN "representativeName",
DROP COLUMN "signedLeaseContract",
DROP COLUMN "structure",
DROP COLUMN "technicalVisibility",
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bicSwift" TEXT,
ADD COLUMN     "brochures" TEXT[],
ADD COLUMN     "displayBoardId" TEXT NOT NULL,
ADD COLUMN     "electricity" TEXT NOT NULL,
ADD COLUMN     "electricitySupply" TEXT,
ADD COLUMN     "framework" TEXT NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "lessorCity" TEXT,
ADD COLUMN     "lessorTypeId" TEXT NOT NULL,
ADD COLUMN     "lighting" TEXT NOT NULL,
ADD COLUMN     "locality" TEXT NOT NULL,
ADD COLUMN     "panelCondition" TEXT NOT NULL,
ADD COLUMN     "paymentFrequency" TEXT,
ADD COLUMN     "paymentMode" TEXT,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "rentalPeriod" TEXT,
ADD COLUMN     "representativeEmail" TEXT,
ADD COLUMN     "representativeFirstName" TEXT,
ADD COLUMN     "representativeJob" TEXT,
ADD COLUMN     "representativeLastName" TEXT,
ADD COLUMN     "representativePhone" TEXT,
ADD COLUMN     "revenueGenerate" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "rib" TEXT,
ADD COLUMN     "structureTypeId" TEXT NOT NULL,
ADD COLUMN     "visualMarker" TEXT NOT NULL,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "display_board" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "display_board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structure_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "structure_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessor_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "lessor_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "display_board_name_key" ON "display_board"("name");

-- CreateIndex
CREATE UNIQUE INDEX "structure_type_name_key" ON "structure_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lessor_type_name_key" ON "lessor_type"("name");

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_displayBoardId_fkey" FOREIGN KEY ("displayBoardId") REFERENCES "display_board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_structureTypeId_fkey" FOREIGN KEY ("structureTypeId") REFERENCES "structure_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_lessorTypeId_fkey" FOREIGN KEY ("lessorTypeId") REFERENCES "lessor_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_board" ADD CONSTRAINT "display_board_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure_type" ADD CONSTRAINT "structure_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessor_type" ADD CONSTRAINT "lessor_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
