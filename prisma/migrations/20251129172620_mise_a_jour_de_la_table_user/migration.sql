-- AlterTable
ALTER TABLE "deletion" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "deletion" ADD CONSTRAINT "deletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
