/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `dibursement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `receipt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dibursement_paymentId_key" ON "dibursement"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_paymentId_key" ON "receipt"("paymentId");
