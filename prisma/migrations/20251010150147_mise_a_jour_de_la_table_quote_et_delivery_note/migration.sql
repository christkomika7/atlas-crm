-- AlterTable
ALTER TABLE "delivery_note" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;
