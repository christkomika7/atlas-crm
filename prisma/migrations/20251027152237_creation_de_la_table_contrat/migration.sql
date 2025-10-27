-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CLIENT', 'LESSOR');

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "contractId" TEXT;

-- CreateTable
CREATE TABLE "contract" (
    "id" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "clientId" TEXT,
    "companyId" TEXT NOT NULL,
    "billboardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "billboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
