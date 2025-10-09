-- AlterTable
ALTER TABLE "dibursement" ADD COLUMN     "referencePurchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "item" ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "receipt" ADD COLUMN     "referencePurchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "recurrence" ADD COLUMN     "purchaseOrderId" TEXT;

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" TEXT NOT NULL,
    "invoiceNumber" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "supplierId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillboardToPurchaseOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToPurchaseOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductServiceToPurchaseOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductServiceToPurchaseOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BillboardToPurchaseOrder_B_index" ON "_BillboardToPurchaseOrder"("B");

-- CreateIndex
CREATE INDEX "_ProductServiceToPurchaseOrder_B_index" ON "_ProductServiceToPurchaseOrder"("B");

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_referencePurchaseOrderId_fkey" FOREIGN KEY ("referencePurchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_referencePurchaseOrderId_fkey" FOREIGN KEY ("referencePurchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToPurchaseOrder" ADD CONSTRAINT "_BillboardToPurchaseOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToPurchaseOrder" ADD CONSTRAINT "_BillboardToPurchaseOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToPurchaseOrder" ADD CONSTRAINT "_ProductServiceToPurchaseOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToPurchaseOrder" ADD CONSTRAINT "_ProductServiceToPurchaseOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
