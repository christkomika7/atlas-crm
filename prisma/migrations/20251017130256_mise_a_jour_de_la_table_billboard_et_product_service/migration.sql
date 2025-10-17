-- AlterTable
ALTER TABLE "billboard" ADD COLUMN     "hasTax" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_service" ADD COLUMN     "hasTax" BOOLEAN NOT NULL DEFAULT false;
