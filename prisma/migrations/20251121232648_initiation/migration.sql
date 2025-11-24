/*
  Warnings:

  - You are about to drop the column `userId` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,resource]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_project_collaborators" DROP CONSTRAINT "_project_collaborators_A_fkey";

-- DropForeignKey
ALTER TABLE "_project_collaborators" DROP CONSTRAINT "_project_collaborators_B_fkey";

-- DropForeignKey
ALTER TABLE "_task_users" DROP CONSTRAINT "_task_users_A_fkey";

-- DropForeignKey
ALTER TABLE "_task_users" DROP CONSTRAINT "_task_users_B_fkey";

-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_teamMemberId_fkey";

-- DropForeignKey
ALTER TABLE "dibursement" DROP CONSTRAINT "dibursement_payOnBehalfOfId_fkey";

-- DropForeignKey
ALTER TABLE "permission" DROP CONSTRAINT "permission_userId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_companyId_fkey";

-- DropIndex
DROP INDEX "permission_userId_resource_key";

-- AlterTable
ALTER TABLE "permission" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "key" SERIAL NOT NULL,
ADD COLUMN     "path" TEXT,
ADD COLUMN     "role" "Role" DEFAULT 'USER';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "companyId",
DROP COLUMN "image",
DROP COLUMN "key",
DROP COLUMN "name",
DROP COLUMN "path",
DROP COLUMN "role";

-- CreateTable
CREATE TABLE "_CompanyToProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompanyToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompanyToProfile_B_index" ON "_CompanyToProfile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "permission_profileId_resource_key" ON "permission"("profileId", "resource");

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_payOnBehalfOfId_fkey" FOREIGN KEY ("payOnBehalfOfId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToProfile" ADD CONSTRAINT "_CompanyToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToProfile" ADD CONSTRAINT "_CompanyToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_project_collaborators" ADD CONSTRAINT "_project_collaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_project_collaborators" ADD CONSTRAINT "_project_collaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_users" ADD CONSTRAINT "_task_users_A_fkey" FOREIGN KEY ("A") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_users" ADD CONSTRAINT "_task_users_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
