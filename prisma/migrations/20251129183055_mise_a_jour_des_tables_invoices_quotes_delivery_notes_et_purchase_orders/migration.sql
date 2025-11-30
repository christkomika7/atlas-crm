-- AlterTable
ALTER TABLE "delivery_note" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
