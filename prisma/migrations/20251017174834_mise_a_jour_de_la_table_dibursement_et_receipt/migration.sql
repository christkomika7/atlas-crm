-- AlterTable
ALTER TABLE "dibursement" ADD COLUMN     "projectId" TEXT,
ALTER COLUMN "checkNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "receipt" ALTER COLUMN "checkNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transaction_category" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'RECEIPT';

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
