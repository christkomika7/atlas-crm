-- AlterTable
ALTER TABLE "dibursement" ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "receipt" ADD COLUMN     "paymentId" TEXT;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
