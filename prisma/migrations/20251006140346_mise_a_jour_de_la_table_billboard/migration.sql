-- AlterTable
ALTER TABLE "billboard" ADD COLUMN     "lessorSpaceType" TEXT NOT NULL DEFAULT 'private',
ADD COLUMN     "lessorSupplierId" TEXT,
ALTER COLUMN "lessorName" DROP NOT NULL,
ALTER COLUMN "lessorEmail" DROP NOT NULL,
ALTER COLUMN "lessorPhone" DROP NOT NULL,
ALTER COLUMN "lessorJob" DROP NOT NULL,
ALTER COLUMN "capital" DROP NOT NULL,
ALTER COLUMN "rccm" DROP NOT NULL,
ALTER COLUMN "taxIdentificationNumber" DROP NOT NULL,
ALTER COLUMN "lessorAddress" DROP NOT NULL,
ALTER COLUMN "representativeName" DROP NOT NULL,
ALTER COLUMN "representativeContract" DROP NOT NULL,
ALTER COLUMN "leasedSpace" DROP NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "specificCondition" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_lessorSupplierId_fkey" FOREIGN KEY ("lessorSupplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
