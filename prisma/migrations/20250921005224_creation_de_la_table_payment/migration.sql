-- CreateTable
CREATE TABLE "public"."payment" (
    "id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "infos" TEXT,
    "invoiceId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
