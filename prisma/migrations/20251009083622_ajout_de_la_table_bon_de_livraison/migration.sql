-- AlterTable
ALTER TABLE "item" ADD COLUMN     "deliveryNoteId" TEXT;

-- CreateTable
CREATE TABLE "delivery_note" (
    "id" TEXT NOT NULL,
    "deliveryNoteNumber" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "clientId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillboardToDeliveryNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToDeliveryNote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DeliveryNoteToProductService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeliveryNoteToProductService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BillboardToDeliveryNote_B_index" ON "_BillboardToDeliveryNote"("B");

-- CreateIndex
CREATE INDEX "_DeliveryNoteToProductService_B_index" ON "_DeliveryNoteToProductService"("B");

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "delivery_note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToDeliveryNote" ADD CONSTRAINT "_BillboardToDeliveryNote_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToDeliveryNote" ADD CONSTRAINT "_BillboardToDeliveryNote_B_fkey" FOREIGN KEY ("B") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToProductService" ADD CONSTRAINT "_DeliveryNoteToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToProductService" ADD CONSTRAINT "_DeliveryNoteToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
