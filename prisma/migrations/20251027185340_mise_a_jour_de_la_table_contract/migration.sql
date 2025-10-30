-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "lessorId" TEXT;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_lessorId_fkey" FOREIGN KEY ("lessorId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
