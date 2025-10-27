-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "billboard" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "delivery_note" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "dibursement" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_service" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "receipt" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "supplier" ADD COLUMN     "hasDelete" BOOLEAN NOT NULL DEFAULT false;
