-- CreateEnum
CREATE TYPE "ItemState" AS ENUM ('IGNORE', 'APPROVED');

-- AlterTable
ALTER TABLE "item" ADD COLUMN     "state" "ItemState" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "amountType" "AmountType" NOT NULL DEFAULT 'TTC';
