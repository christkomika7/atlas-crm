-- CreateEnum
CREATE TYPE "LessorSpace" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "lessor_type" ADD COLUMN     "type" "LessorSpace" NOT NULL DEFAULT 'PRIVATE';
