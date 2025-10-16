/*
  Warnings:

  - You are about to drop the column `referencePurchaseOrderId` on the `receipt` table. All the data in the column will be lost.
  - You are about to drop the `_BillboardToPurchaseOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_BillboardToPurchaseOrder" DROP CONSTRAINT "_BillboardToPurchaseOrder_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BillboardToPurchaseOrder" DROP CONSTRAINT "_BillboardToPurchaseOrder_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."receipt" DROP CONSTRAINT "receipt_referencePurchaseOrderId_fkey";

-- AlterTable
ALTER TABLE "receipt" DROP COLUMN "referencePurchaseOrderId";

-- DropTable
DROP TABLE "public"."_BillboardToPurchaseOrder";
