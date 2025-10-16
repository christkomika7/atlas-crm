-- AlterTable
ALTER TABLE "public"."invoice" ALTER COLUMN "clientId" DROP NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL;
