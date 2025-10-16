/*
  Warnings:

  - The `rentalPrice` column on the `billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `installationCost` column on the `billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maintenance` column on the `billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `capital` column on the `billboard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `capitalAmount` column on the `company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `dibursement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `totalHT` column on the `invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `totalTTC` column on the `invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payee` column on the `invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `price` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedPrice` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `unitPrice` column on the `product_service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cost` column on the `product_service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salary` column on the `profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isPaid` on the `quote` table. All the data in the column will be lost.
  - You are about to drop the column `payee` on the `quote` table. All the data in the column will be lost.
  - The `totalHT` column on the `quote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `totalTTC` column on the `quote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "billboard" DROP COLUMN "rentalPrice",
ADD COLUMN     "rentalPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "installationCost",
ADD COLUMN     "installationCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "maintenance",
ADD COLUMN     "maintenance" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "capital",
ADD COLUMN     "capital" DECIMAL(15,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "company" DROP COLUMN "capitalAmount",
ADD COLUMN     "capitalAmount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "dibursement" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "totalHT",
ADD COLUMN     "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "totalTTC",
ADD COLUMN     "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "payee",
ADD COLUMN     "payee" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "item" DROP COLUMN "price",
ADD COLUMN     "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "updatedPrice",
ADD COLUMN     "updatedPrice" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_service" DROP COLUMN "unitPrice",
ADD COLUMN     "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "cost",
ADD COLUMN     "cost" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "salary",
ADD COLUMN     "salary" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quote" DROP COLUMN "isPaid",
DROP COLUMN "payee",
DROP COLUMN "totalHT",
ADD COLUMN     "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
DROP COLUMN "totalTTC",
ADD COLUMN     "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "receipt" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;
