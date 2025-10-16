-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "totalHT" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" TEXT NOT NULL,
    "payee" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence" (
    "id" TEXT NOT NULL,
    "repeat" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillboardToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ItemToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ItemToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductServiceToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductServiceToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BillboardToQuote_B_index" ON "_BillboardToQuote"("B");

-- CreateIndex
CREATE INDEX "_ItemToQuote_B_index" ON "_ItemToQuote"("B");

-- CreateIndex
CREATE INDEX "_ProductServiceToQuote_B_index" ON "_ProductServiceToQuote"("B");

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToQuote" ADD CONSTRAINT "_BillboardToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToQuote" ADD CONSTRAINT "_BillboardToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToQuote" ADD CONSTRAINT "_ItemToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToQuote" ADD CONSTRAINT "_ItemToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToQuote" ADD CONSTRAINT "_ProductServiceToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToQuote" ADD CONSTRAINT "_ProductServiceToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
