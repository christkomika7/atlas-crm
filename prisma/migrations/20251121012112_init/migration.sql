-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CLIENT', 'LESSOR');

-- CreateEnum
CREATE TYPE "DeletionType" AS ENUM ('QUOTES', 'INVOICES', 'DELIVERY_NOTES', 'PURCHASE_ORDERS', 'RECEIPTS', 'DISBURSEMENTS', 'PRODUCT_SERVICES', 'BILLBOARDS', 'CLIENTS', 'SUPPLIERS', 'PROJECTS', 'CONTRACT', 'APPOINTMENTS');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CASH', 'BANK');

-- CreateEnum
CREATE TYPE "Resource" AS ENUM ('DASHBOARD', 'CLIENTS', 'SUPPLIERS', 'INVOICES', 'QUOTES', 'DELIVERY_NOTES', 'PURCHASE_ORDER', 'CREDIT_NOTES', 'PRODUCT_SERVICES', 'BILLBOARDS', 'PROJECTS', 'APPOINTMENT', 'TRANSACTION', 'SETTING', 'CONTRACT');

-- CreateEnum
CREATE TYPE "ItemState" AS ENUM ('IGNORE', 'APPROVED', 'PURCHASE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEIPT', 'DISBURSEMENT');

-- CreateEnum
CREATE TYPE "Action" AS ENUM ('READ', 'CREATE', 'MODIFY');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('URGENT', 'NORMAL', 'RELAX');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProductServiceType" AS ENUM ('PRODUCT', 'SERVICE');

-- CreateEnum
CREATE TYPE "BankTransaction" AS ENUM ('INFLOWS', 'OUTFLOWS');

-- CreateEnum
CREATE TYPE "AmountType" AS ENUM ('HT', 'TTC');

-- CreateEnum
CREATE TYPE "ItemInvoiceType" AS ENUM ('INVOICES', 'QUOTES', 'DELIVERY_NOTES', 'PURCHASE_ORDERS', 'CREDIT_NOTES');

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "registeredAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "businessRegistrationNumber" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "niu" TEXT DEFAULT '',
    "legalForms" TEXT NOT NULL DEFAULT '',
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
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "key" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" DEFAULT 'USER',
    "currentCompany" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
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
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessSector" TEXT NOT NULL,
    "website" TEXT,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "due" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "job" TEXT DEFAULT '',
    "legalForms" TEXT NOT NULL DEFAULT '',
    "capital" TEXT NOT NULL DEFAULT '0',
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
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "path" TEXT,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "due" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "businessSector" TEXT NOT NULL,
    "businessRegistrationNumber" TEXT NOT NULL,
    "taxIdentificationNumber" TEXT NOT NULL,
    "job" TEXT DEFAULT '',
    "legalForms" TEXT NOT NULL DEFAULT '',
    "capital" TEXT NOT NULL DEFAULT '0',
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
CREATE TABLE "appointment" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "notify" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "contract" (
    "id" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "lessorId" TEXT,
    "lessorType" TEXT,
    "companyId" TEXT NOT NULL,
    "billboardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billboard" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "hasTax" BOOLEAN NOT NULL DEFAULT false,
    "typeId" TEXT NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "visualMarker" TEXT NOT NULL,
    "displayBoardId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "orientation" TEXT NOT NULL,
    "gmaps" TEXT NOT NULL,
    "pathPhoto" TEXT NOT NULL,
    "pathBrochure" TEXT NOT NULL,
    "photos" TEXT[],
    "brochures" TEXT[],
    "rentalPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "installationCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "maintenance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "revenueGenerate" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "lighting" TEXT NOT NULL,
    "structureTypeId" TEXT NOT NULL,
    "panelCondition" TEXT NOT NULL,
    "decorativeElement" TEXT NOT NULL,
    "foundations" TEXT NOT NULL,
    "electricity" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "lessorSpaceType" TEXT NOT NULL,
    "lessorSupplierId" TEXT,
    "lessorTypeId" TEXT NOT NULL,
    "lessorName" TEXT,
    "lessorAddress" TEXT,
    "lessorCity" TEXT,
    "lessorPhone" TEXT,
    "lessorEmail" TEXT,
    "capital" DECIMAL(15,2) DEFAULT 0,
    "niu" TEXT DEFAULT '',
    "legalForms" TEXT NOT NULL DEFAULT '',
    "rccm" TEXT,
    "taxIdentificationNumber" TEXT,
    "bankName" TEXT,
    "rib" TEXT,
    "iban" TEXT,
    "bicSwift" TEXT,
    "representativeFirstName" TEXT,
    "representativeLastName" TEXT,
    "representativeJob" TEXT,
    "representativePhone" TEXT,
    "representativeEmail" TEXT,
    "rentalStartDate" TIMESTAMP(3),
    "rentalPeriod" TEXT,
    "paymentMode" TEXT,
    "paymentFrequency" TEXT,
    "electricitySupply" TEXT,
    "specificCondition" TEXT,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" SERIAL NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "clientId" TEXT,
    "fromRecordReference" TEXT NOT NULL DEFAULT '',
    "fromRecordId" TEXT NOT NULL DEFAULT '',
    "fromRecordName" TEXT NOT NULL DEFAULT '',
    "contractId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" TEXT NOT NULL,
    "purchaseOrderNumber" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "supplierId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" SERIAL NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "fromRecordReference" TEXT NOT NULL DEFAULT '',
    "fromRecordId" TEXT NOT NULL DEFAULT '',
    "fromRecordName" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_note" (
    "id" TEXT NOT NULL,
    "deliveryNoteNumber" SERIAL NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL,
    "files" TEXT[],
    "pathFiles" TEXT NOT NULL,
    "amountType" "AmountType" NOT NULL DEFAULT 'TTC',
    "totalHT" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "paymentLimit" TEXT NOT NULL,
    "totalTTC" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "fromRecordReference" TEXT NOT NULL DEFAULT '',
    "fromRecordId" TEXT NOT NULL DEFAULT '',
    "fromRecordName" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT,
    "projectId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence" (
    "id" TEXT NOT NULL,
    "repeat" TEXT NOT NULL,
    "invoiceId" TEXT,
    "purchaseOrderId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL,
    "infos" TEXT,
    "invoiceId" TEXT,
    "purchaseOrderId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL DEFAULT '',
    "state" "ItemState" NOT NULL DEFAULT 'APPROVED',
    "hasTax" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "updatedPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "locationStart" TIMESTAMP(3) NOT NULL,
    "locationEnd" TIMESTAMP(3) NOT NULL,
    "itemInvoiceType" "ItemInvoiceType" NOT NULL DEFAULT 'INVOICES',
    "invoiceId" TEXT,
    "quoteId" TEXT,
    "billboardId" TEXT,
    "productServiceId" TEXT,
    "purchaseOrderId" TEXT,
    "deliveryNoteId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "projectInformation" TEXT,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "files" TEXT[],
    "path" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'BLOCKED',
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "path" TEXT,
    "time" TIMESTAMP(3) NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "comment" TEXT NOT NULL,
    "file" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'TODO',
    "projectId" TEXT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_step" (
    "id" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "check" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billboard_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "billboard_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_board" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "display_board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "structure_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "structure_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessor_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "lessor_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_documents" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
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
CREATE TABLE "receipt" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'RECEIPT',
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "reference" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "movement" "BankTransaction" NOT NULL DEFAULT 'INFLOWS',
    "categoryId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountType" "AmountType" NOT NULL DEFAULT 'HT',
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT,
    "referenceInvoiceId" TEXT,
    "sourceId" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "clientId" TEXT,
    "supplierId" TEXT,
    "companyId" TEXT NOT NULL,
    "paymentId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dibursement" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'DISBURSEMENT',
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "reference" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "movement" "BankTransaction" NOT NULL DEFAULT 'OUTFLOWS',
    "categoryId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountType" "AmountType" NOT NULL DEFAULT 'HT',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "paymentType" TEXT NOT NULL,
    "checkNumber" TEXT,
    "referenceInvoiceId" TEXT,
    "referencePurchaseOrderId" TEXT,
    "allocationId" TEXT,
    "sourceId" TEXT,
    "payOnBehalfOfId" TEXT,
    "description" TEXT,
    "comment" TEXT,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "supplierId" TEXT,
    "fiscalObjectId" TEXT,
    "paymentId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dibursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'CASH',
    "companyId" TEXT NOT NULL,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_object" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscal_object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'RECEIPT',
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_nature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "transaction_nature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "natureId" TEXT NOT NULL,

    CONSTRAINT "allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion" (
    "id" TEXT NOT NULL,
    "type" "DeletionType" NOT NULL,
    "recordId" TEXT NOT NULL,
    "isValidate" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" "Resource" NOT NULL,
    "actions" "Action"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
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
CREATE TABLE "account" (
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
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "count" INTEGER,
    "lastRequest" BIGINT,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_service" (
    "id" TEXT NOT NULL,
    "type" "ProductServiceType" NOT NULL DEFAULT 'PRODUCT',
    "hasTax" BOOLEAN NOT NULL DEFAULT false,
    "hasDelete" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "unitType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BillboardToInvoice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToInvoice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BillboardToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BillboardToDeliveryNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillboardToDeliveryNote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InvoiceToProductService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoiceToProductService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DeliveryNoteToProductService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeliveryNoteToProductService_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_project_collaborators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_project_collaborators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_task_users" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_task_users_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductServiceToQuote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductServiceToQuote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductServiceToPurchaseOrder" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductServiceToPurchaseOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_companyName_key" ON "company"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_companyName_key" ON "supplier"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "billboard_reference_key" ON "billboard"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "project_name_key" ON "project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "city_name_key" ON "city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "area_name_key" ON "area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "billboard_type_name_key" ON "billboard_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "display_board_name_key" ON "display_board"("name");

-- CreateIndex
CREATE UNIQUE INDEX "structure_type_name_key" ON "structure_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lessor_type_name_key" ON "lessor_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_documents_companyId_key" ON "company_documents"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_paymentId_key" ON "receipt"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "dibursement_paymentId_key" ON "dibursement"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_object_name_key" ON "fiscal_object"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_category_name_key" ON "transaction_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_name_key" ON "allocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "deletion_recordId_key" ON "deletion"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_userId_resource_key" ON "permission"("userId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "_BillboardToInvoice_B_index" ON "_BillboardToInvoice"("B");

-- CreateIndex
CREATE INDEX "_BillboardToQuote_B_index" ON "_BillboardToQuote"("B");

-- CreateIndex
CREATE INDEX "_BillboardToDeliveryNote_B_index" ON "_BillboardToDeliveryNote"("B");

-- CreateIndex
CREATE INDEX "_InvoiceToProductService_B_index" ON "_InvoiceToProductService"("B");

-- CreateIndex
CREATE INDEX "_DeliveryNoteToProductService_B_index" ON "_DeliveryNoteToProductService"("B");

-- CreateIndex
CREATE INDEX "_project_collaborators_B_index" ON "_project_collaborators"("B");

-- CreateIndex
CREATE INDEX "_task_users_B_index" ON "_task_users"("B");

-- CreateIndex
CREATE INDEX "_ProductServiceToQuote_B_index" ON "_ProductServiceToQuote"("B");

-- CreateIndex
CREATE INDEX "_ProductServiceToPurchaseOrder_B_index" ON "_ProductServiceToPurchaseOrder"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_lessorId_fkey" FOREIGN KEY ("lessorId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "billboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "billboard_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_displayBoardId_fkey" FOREIGN KEY ("displayBoardId") REFERENCES "display_board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_structureTypeId_fkey" FOREIGN KEY ("structureTypeId") REFERENCES "structure_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_lessorSupplierId_fkey" FOREIGN KEY ("lessorSupplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_lessorTypeId_fkey" FOREIGN KEY ("lessorTypeId") REFERENCES "lessor_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard" ADD CONSTRAINT "billboard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order" ADD CONSTRAINT "purchase_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_note" ADD CONSTRAINT "delivery_note_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence" ADD CONSTRAINT "recurrence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "billboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES "product_service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "delivery_note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_step" ADD CONSTRAINT "task_step_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billboard_type" ADD CONSTRAINT "billboard_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_board" ADD CONSTRAINT "display_board_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure_type" ADD CONSTRAINT "structure_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessor_type" ADD CONSTRAINT "lessor_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_referencePurchaseOrderId_fkey" FOREIGN KEY ("referencePurchaseOrderId") REFERENCES "purchase_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "allocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_payOnBehalfOfId_fkey" FOREIGN KEY ("payOnBehalfOfId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_fiscalObjectId_fkey" FOREIGN KEY ("fiscalObjectId") REFERENCES "fiscal_object"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dibursement" ADD CONSTRAINT "dibursement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_object" ADD CONSTRAINT "fiscal_object_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_nature" ADD CONSTRAINT "transaction_nature_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "transaction_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_nature" ADD CONSTRAINT "transaction_nature_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES "transaction_nature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion" ADD CONSTRAINT "deletion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_service" ADD CONSTRAINT "product_service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToInvoice" ADD CONSTRAINT "_BillboardToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToInvoice" ADD CONSTRAINT "_BillboardToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToQuote" ADD CONSTRAINT "_BillboardToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToQuote" ADD CONSTRAINT "_BillboardToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToDeliveryNote" ADD CONSTRAINT "_BillboardToDeliveryNote_A_fkey" FOREIGN KEY ("A") REFERENCES "billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillboardToDeliveryNote" ADD CONSTRAINT "_BillboardToDeliveryNote_B_fkey" FOREIGN KEY ("B") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToProductService" ADD CONSTRAINT "_InvoiceToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToProductService" ADD CONSTRAINT "_InvoiceToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToProductService" ADD CONSTRAINT "_DeliveryNoteToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES "delivery_note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeliveryNoteToProductService" ADD CONSTRAINT "_DeliveryNoteToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_project_collaborators" ADD CONSTRAINT "_project_collaborators_A_fkey" FOREIGN KEY ("A") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_project_collaborators" ADD CONSTRAINT "_project_collaborators_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_users" ADD CONSTRAINT "_task_users_A_fkey" FOREIGN KEY ("A") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_users" ADD CONSTRAINT "_task_users_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToQuote" ADD CONSTRAINT "_ProductServiceToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToQuote" ADD CONSTRAINT "_ProductServiceToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToPurchaseOrder" ADD CONSTRAINT "_ProductServiceToPurchaseOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "product_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductServiceToPurchaseOrder" ADD CONSTRAINT "_ProductServiceToPurchaseOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
