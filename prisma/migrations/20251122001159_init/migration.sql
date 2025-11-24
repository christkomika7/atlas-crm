/*
  Warnings:

  - You are about to drop the column `key` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the `_CompanyToProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CompanyToProfile" DROP CONSTRAINT "_CompanyToProfile_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToProfile" DROP CONSTRAINT "_CompanyToProfile_B_fkey";

-- DropIndex
DROP INDEX "profile_userId_key";

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "key",
ADD COLUMN     "companyId" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "_CompanyToProfile";

-- CreateIndex
CREATE UNIQUE INDEX "profile_companyId_key" ON "profile"("companyId");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
