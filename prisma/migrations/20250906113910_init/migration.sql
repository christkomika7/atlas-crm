-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."Resource" AS ENUM ('DASHBOARD', 'CLIENTS', 'SUPPLIERS', 'INVOICES', 'QUOTES', 'DELIVERY_NOTES', 'PURCHASE_ORDER', 'CREDIT_NOTES', 'PRODUCT_SERVICES', 'BILLBOARDS', 'PROJECTS', 'APPOINTMENT', 'TRANSACTION', 'SETTING');

-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('READ', 'CREATE', 'MODIFY');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('URGENT', 'NORMAL', 'RELAX');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."ProductServiceType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "public"."ItemInvoiceType" AS ENUM ('INVOICES', 'QUOTES', 'DELIVERY_NOTES', 'PURCHASE_ORDERS', 'CREDIT_NOTES');

-- CreateTable
CREATE TABLE "public"."company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "registeredAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "businessRegistrationNumber" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "capitalAmount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "bankAccountDetails" TEXT NOT NULL,
    "businessActivityType" TEXT NOT NULL,
    "fiscalYearStart" TIMESTAMP(3) NOT NULL,
    "fiscalYearEnd" TIMESTAMP(3) NOT NULL,
    "vatRates" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supplier" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessSector" TEXT NOT NULL,
    "website" TEXT,
    "paidAmount" TEXT NOT NULL DEFAULT '0',
    "due" TEXT NOT NULL DEFAULT '0',
    "address" TEXT NOT NULL,
    "businessRegistrationNumber" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "information" TEXT,
    "path" TEXT NOT NULL,
    "uploadDocuments" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "key" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" DEFAULT 'USER',
    "currentCompany" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT,
    "job" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "internalRegulations" TEXT,
    "passport" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "path" TEXT,
    "paidAmount" TEXT NOT NULL DEFAULT '0',
    "due" TEXT NOT NULL DEFAULT '0',
    "businessSector" TEXT NOT NULL,
    "businessRegistrationNumber" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "information" TEXT,
    "uploadDocuments" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "documents" TEXT[],
    "teamMemberName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "teamMemberId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billboard" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "information" TEXT,
    "address" TEXT NOT NULL,
    "gmaps" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "rentalPrice" TEXT NOT NULL,
    "installationCost" TEXT NOT NULL,
    "maintenance" TEXT NOT NULL,
    "imageFiles" TEXT[],
    "brochureFiles" TEXT[],
    "structure" TEXT NOT NULL,
    "decorativeElement" TEXT NOT NULL,
    "foundations" TEXT NOT NULL,
    "technicalVisibility" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "locationStart" TIMESTAMP(3),
    "locationEnd" TIMESTAMP(3),
    "lessorType" TEXT NOT NULL,
    "lessorName" TEXT NOT NULL,
    "lessorEmail" TEXT NOT NULL,
    "lessorPhone" TEXT NOT NULL,
    "lessorJob" TEXT NOT NULL,
    "capital" TEXT NOT NULL,
    "rccm" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "lessorAddress" TEXT NOT NULL,
    "representativeName" TEXT NOT NULL,
    "representativeContract" TEXT NOT NULL,
    "leasedSpace" TEXT NOT NULL,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "paymentMethod" TEXT NOT NULL,
    "specificCondition" TEXT NOT NULL,
    "signedLeaseContract" TEXT[],
    "files" TEXT[],
    "revenueGenerate" TEXT NOT NULL DEFAULT '0',
    "pathPhoto" TEXT NOT NULL,
    "pathBrochure" TEXT NOT NULL,
    "pathContract" TEXT NOT NULL,
    "pathFile" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "photos" TEXT[],
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "pathPhotos" TEXT NOT NULL,
    "totalHT" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "totalTTC" TEXT NOT NULL,
    "payee" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "updatedPrice" TEXT NOT NULL,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "locationStart" TIMESTAMP(3) NOT NULL,
    "locationEnd" TIMESTAMP(3) NOT NULL,
    "itemInvoiceType" "public"."ItemInvoiceType" NOT NULL DEFAULT 'INVOICES',
    "invoiceId" TEXT,
    "billboardId" TEXT,
    "productServiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "projectInformation" TEXT,
    "amount" TEXT NOT NULL DEFAULT '0',
    "balance" TEXT NOT NULL DEFAULT '0',
    "files" TEXT[],
    "path" TEXT NOT NULL,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'BLOCKED',
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "path" TEXT,
    "time" TIMESTAMP(3) NOT NULL,
    "priority" "public"."Priority" NOT NULL DEFAULT 'NORMAL',
    "comment" TEXT NOT NULL,
    "file" TEXT[],
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'TODO',
    "projectId" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_step" (
    "id" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "check" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."city" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billboard_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "billboard_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."company_documents" (
    "id" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "quotesPrefix" TEXT,
    "invoicesPrefix" TEXT,
    "deliveryNotesPrefix" TEXT,
    "purchaseOrderPrefix" TEXT,
    "quotesInfo" TEXT,
    "invoicesInfo" TEXT,
    "deliveryNotesInfo" TEXT,
    "purchaseOrderInfo" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" "public"."Resource" NOT NULL,
    "actions" "public"."Action"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "count" INTEGER,
    "lastRequest" BIGINT,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_service" (
    "id" TEXT NOT NULL,
    "type" "public"."ProductServiceType" NOT NULL DEFAULT 'PRODUCT',
    "reference" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_BillboardToInvoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToInvoice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_InvoiceToProductService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoiceToProductService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_project_collaborators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_project_collaborators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_task_users" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_task_users_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_companyName_key" ON "public"."company"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "public"."company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_companyName_key" ON "public"."supplier"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "public"."profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "billboard_reference_key" ON "public"."billboard"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "billboard_name_key" ON "public"."billboard"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_name_key" ON "public"."project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_key" ON "public"."city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "area_name_key" ON "public"."area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "billboard_type_name_key" ON "public"."billboard_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_documents_companyId_key" ON "public"."company_documents"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_userId_resource_key" ON "public"."permission"("userId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "_BillboardToInvoice_B_index" ON "public"."_BillboardToInvoice"("B");

-- CreateIndex
CREATE INDEX "_InvoiceToProductService_B_index" ON "public"."_InvoiceToProductService"("B");

-- CreateIndex
CREATE INDEX "_project_collaborators_B_index" ON "public"."_project_collaborators"("B");

-- CreateIndex
CREATE INDEX "_task_users_B_index" ON "public"."_task_users"("B");

-- AddForeignKey
ALTER TABLE "public"."supplier" ADD CONSTRAINT "supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client" ADD CONSTRAINT "client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."billboard_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "public"."area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard" ADD CONSTRAINT "billboard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item" ADD CONSTRAINT "item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item" ADD CONSTRAINT "item_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "public"."billboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item" ADD CONSTRAINT "item_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES "public"."product_service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_step" ADD CONSTRAINT "task_step_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."city" ADD CONSTRAINT "city_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."area" ADD CONSTRAINT "area_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."area" ADD CONSTRAINT "area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billboard_type" ADD CONSTRAINT "billboard_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."company_documents" ADD CONSTRAINT "company_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."permission" ADD CONSTRAINT "permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_service" ADD CONSTRAINT "product_service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BillboardToInvoice" ADD CONSTRAINT "_BillboardToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BillboardToInvoice" ADD CONSTRAINT "_BillboardToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InvoiceToProductService" ADD CONSTRAINT "_InvoiceToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InvoiceToProductService" ADD CONSTRAINT "_InvoiceToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_project_collaborators" ADD CONSTRAINT "_project_collaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_project_collaborators" ADD CONSTRAINT "_project_collaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_task_users" ADD CONSTRAINT "_task_users_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_task_users" ADD CONSTRAINT "_task_users_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
