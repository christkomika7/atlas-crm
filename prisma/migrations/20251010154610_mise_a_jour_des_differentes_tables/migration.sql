-- CreateTable
CREATE TABLE "_InvoiceToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoiceToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DeliveryNoteToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeliveryNoteToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InvoiceToQuote_B_index" ON "_InvoiceToQuote"("B");

-- CreateIndex
CREATE INDEX "_DeliveryNoteToQuote_B_index" ON "_DeliveryNoteToQuote"("B");

-- AddForeignKey
ALTER TABLE "_InvoiceToQuote" ADD CONSTRAINT "_InvoiceToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToQuote" ADD CONSTRAINT "_InvoiceToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToQuote" ADD CONSTRAINT "_DeliveryNoteToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToQuote" ADD CONSTRAINT "_DeliveryNoteToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
