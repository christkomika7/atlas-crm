-- AlterTable
ALTER TABLE "public"."company" ADD COLUMN     "city" TEXT NOT NULL DEFAULT 'Pointe-Noire',
ADD COLUMN     "codePostal" TEXT NOT NULL DEFAULT '0000';
