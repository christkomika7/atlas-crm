--
-- PostgreSQL database dump
--

\restrict F5tWe4e9o8BvdekGVaBtlk1b4zhV6a5OwT6GBrP2ftvPAXidbchA197GhajgC0B

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: upside
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO upside;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: upside
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Action; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."Action" AS ENUM (
    'READ',
    'CREATE',
    'MODIFY'
);


ALTER TYPE public."Action" OWNER TO upside;

--
-- Name: AmountType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."AmountType" AS ENUM (
    'HT',
    'TTC'
);


ALTER TYPE public."AmountType" OWNER TO upside;

--
-- Name: BankTransaction; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."BankTransaction" AS ENUM (
    'INFLOWS',
    'OUTFLOWS'
);


ALTER TYPE public."BankTransaction" OWNER TO upside;

--
-- Name: ContractType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."ContractType" AS ENUM (
    'CLIENT',
    'LESSOR'
);


ALTER TYPE public."ContractType" OWNER TO upside;

--
-- Name: DeletionType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."DeletionType" AS ENUM (
    'QUOTES',
    'INVOICES',
    'DELIVERY_NOTES',
    'PURCHASE_ORDERS',
    'RECEIPTS',
    'DISBURSEMENTS',
    'PRODUCT_SERVICES',
    'BILLBOARDS',
    'CLIENTS',
    'SUPPLIERS',
    'PROJECTS',
    'CONTRACT',
    'APPOINTMENTS'
);


ALTER TYPE public."DeletionType" OWNER TO upside;

--
-- Name: ItemInvoiceType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."ItemInvoiceType" AS ENUM (
    'INVOICES',
    'QUOTES',
    'DELIVERY_NOTES',
    'PURCHASE_ORDERS',
    'CREDIT_NOTES'
);


ALTER TYPE public."ItemInvoiceType" OWNER TO upside;

--
-- Name: ItemState; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."ItemState" AS ENUM (
    'IGNORE',
    'APPROVED',
    'PURCHASE'
);


ALTER TYPE public."ItemState" OWNER TO upside;

--
-- Name: LessorSpace; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."LessorSpace" AS ENUM (
    'PUBLIC',
    'PRIVATE'
);


ALTER TYPE public."LessorSpace" OWNER TO upside;

--
-- Name: NotificationKindOf; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."NotificationKindOf" AS ENUM (
    'INVOICE',
    'PURCHASE_ORDER',
    'QUOTE',
    'DELIVERY_NOTE',
    'RECEIPT',
    'DISBURSEMENT',
    'APPOINTMENT',
    'TASK',
    'TRANSFER'
);


ALTER TYPE public."NotificationKindOf" OWNER TO upside;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ALERT',
    'CONFIRM'
);


ALTER TYPE public."NotificationType" OWNER TO upside;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."Priority" AS ENUM (
    'URGENT',
    'NORMAL',
    'RELAX'
);


ALTER TYPE public."Priority" OWNER TO upside;

--
-- Name: ProductServiceType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."ProductServiceType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ProductServiceType" OWNER TO upside;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED'
);


ALTER TYPE public."ProjectStatus" OWNER TO upside;

--
-- Name: Resource; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."Resource" AS ENUM (
    'DASHBOARD',
    'CLIENTS',
    'SUPPLIERS',
    'INVOICES',
    'QUOTES',
    'DELIVERY_NOTES',
    'PURCHASE_ORDER',
    'CREDIT_NOTES',
    'PRODUCT_SERVICES',
    'BILLBOARDS',
    'PROJECTS',
    'APPOINTMENT',
    'TRANSACTION',
    'SETTING',
    'CONTRACT',
    'UNKNOWN_RESOURCE'
);


ALTER TYPE public."Resource" OWNER TO upside;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO upside;

--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."SourceType" AS ENUM (
    'CASH',
    'BANK',
    'WITHDRAWAL'
);


ALTER TYPE public."SourceType" OWNER TO upside;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: upside
--

CREATE TYPE public."TransactionType" AS ENUM (
    'RECEIPT',
    'DISBURSEMENT'
);


ALTER TYPE public."TransactionType" OWNER TO upside;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _BillboardToDeliveryNote; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_BillboardToDeliveryNote" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_BillboardToDeliveryNote" OWNER TO upside;

--
-- Name: _BillboardToInvoice; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_BillboardToInvoice" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_BillboardToInvoice" OWNER TO upside;

--
-- Name: _BillboardToQuote; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_BillboardToQuote" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_BillboardToQuote" OWNER TO upside;

--
-- Name: _ContractToInvoice; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_ContractToInvoice" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ContractToInvoice" OWNER TO upside;

--
-- Name: _DeliveryNoteToProductService; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_DeliveryNoteToProductService" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_DeliveryNoteToProductService" OWNER TO upside;

--
-- Name: _DibursementToSupplier; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_DibursementToSupplier" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_DibursementToSupplier" OWNER TO upside;

--
-- Name: _InvoiceToProductService; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_InvoiceToProductService" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_InvoiceToProductService" OWNER TO upside;

--
-- Name: _ProductServiceToPurchaseOrder; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_ProductServiceToPurchaseOrder" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProductServiceToPurchaseOrder" OWNER TO upside;

--
-- Name: _ProductServiceToQuote; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."_ProductServiceToQuote" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProductServiceToQuote" OWNER TO upside;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO upside;

--
-- Name: _project_collaborators; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public._project_collaborators (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public._project_collaborators OWNER TO upside;

--
-- Name: _task_users; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public._task_users (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public._task_users OWNER TO upside;

--
-- Name: account; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.account OWNER TO upside;

--
-- Name: allocation; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.allocation (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL,
    "natureId" text NOT NULL
);


ALTER TABLE public.allocation OWNER TO upside;

--
-- Name: appointment; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.appointment (
    id text NOT NULL,
    subject text NOT NULL,
    address text NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "time" text NOT NULL,
    notify boolean DEFAULT false NOT NULL,
    email text NOT NULL,
    path text NOT NULL,
    documents text[],
    "teamMemberName" text NOT NULL,
    "clientId" text NOT NULL,
    "teamMemberId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.appointment OWNER TO upside;

--
-- Name: area; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.area (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL,
    "cityId" text NOT NULL
);


ALTER TABLE public.area OWNER TO upside;

--
-- Name: billboard; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.billboard (
    id text NOT NULL,
    reference text NOT NULL,
    "hasTax" boolean DEFAULT false NOT NULL,
    "typeId" text NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    name text NOT NULL,
    locality text NOT NULL,
    "areaId" text NOT NULL,
    "visualMarker" text NOT NULL,
    "displayBoardId" text NOT NULL,
    "cityId" text NOT NULL,
    orientation text NOT NULL,
    gmaps text NOT NULL,
    "pathPhoto" text NOT NULL,
    "pathBrochure" text NOT NULL,
    photos text[],
    brochures text[],
    "rentalPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    "installationCost" numeric(15,2) DEFAULT 0 NOT NULL,
    maintenance numeric(15,2) DEFAULT 0 NOT NULL,
    "revenueGenerate" numeric(15,2) DEFAULT 0 NOT NULL,
    width double precision NOT NULL,
    height double precision NOT NULL,
    lighting text,
    "structureTypeId" text,
    "panelCondition" text,
    "decorativeElement" text,
    foundations text,
    electricity text,
    framework text,
    note text,
    "lessorSpaceType" text NOT NULL,
    "lessorSupplierId" text,
    "lessorTypeId" text NOT NULL,
    "lessorName" text,
    "lessorAddress" text,
    "lessorCity" text,
    "lessorPhone" text,
    "lessorEmail" text,
    "identityCard" text,
    capital numeric(15,2) DEFAULT 0,
    niu text DEFAULT ''::text,
    "legalForms" text DEFAULT ''::text NOT NULL,
    rccm text,
    "taxIdentificationNumber" text,
    "bankName" text,
    rib text,
    iban text,
    "bicSwift" text,
    "representativeFirstName" text,
    "representativeLastName" text,
    "representativeJob" text,
    "representativePhone" text,
    "representativeEmail" text,
    "rentalStartDate" timestamp(3) without time zone,
    "delayContractStart" timestamp(3) without time zone,
    "delayContractEnd" timestamp(3) without time zone,
    "locationPrice" text,
    "nonLocationPrice" text,
    "rentalPeriod" text,
    "paymentMode" text,
    "paymentFrequency" text,
    "electricitySupply" text,
    "specificCondition" text,
    "companyId" text NOT NULL,
    "clientId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.billboard OWNER TO upside;

--
-- Name: billboard_type; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.billboard_type (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.billboard_type OWNER TO upside;

--
-- Name: city; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.city (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.city OWNER TO upside;

--
-- Name: client; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.client (
    id text NOT NULL,
    "companyName" text NOT NULL,
    lastname text NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    firstname text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    website text,
    address text NOT NULL,
    path text,
    "paidAmount" numeric(15,2) DEFAULT 0 NOT NULL,
    due numeric(15,2) DEFAULT 0 NOT NULL,
    "businessSector" text NOT NULL,
    "businessRegistrationNumber" text NOT NULL,
    "taxIdentificationNumber" text NOT NULL,
    job text DEFAULT ''::text,
    "legalForms" text DEFAULT ''::text NOT NULL,
    capital text DEFAULT '0'::text,
    discount text NOT NULL,
    "paymentTerms" text NOT NULL,
    information text,
    "uploadDocuments" text[],
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.client OWNER TO upside;

--
-- Name: company; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.company (
    id text NOT NULL,
    "companyName" text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    "codePostal" text NOT NULL,
    "registeredAddress" text NOT NULL,
    "phoneNumber" text NOT NULL,
    email text NOT NULL,
    website text,
    "businessRegistrationNumber" text NOT NULL,
    "taxIdentificationNumber" text NOT NULL,
    niu text DEFAULT ''::text,
    "legalForms" text DEFAULT ''::text NOT NULL,
    "capitalAmount" text NOT NULL,
    currency text NOT NULL,
    "bankAccountDetails" text NOT NULL,
    "businessActivityType" text NOT NULL,
    "fiscalYearStart" timestamp(3) without time zone NOT NULL,
    "fiscalYearEnd" timestamp(3) without time zone NOT NULL,
    "vatRates" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company OWNER TO upside;

--
-- Name: company_documents; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.company_documents (
    id text NOT NULL,
    logo text,
    "position" text NOT NULL,
    size text NOT NULL,
    "primaryColor" text NOT NULL,
    "secondaryColor" text NOT NULL,
    "quotesPrefix" text,
    "invoicesPrefix" text,
    "deliveryNotesPrefix" text,
    "purchaseOrderPrefix" text,
    "quotesInfo" text,
    "invoicesInfo" text,
    "deliveryNotesInfo" text,
    "purchaseOrderInfo" text,
    "companyId" text NOT NULL,
    "recordFiles" text[]
);


ALTER TABLE public.company_documents OWNER TO upside;

--
-- Name: contract; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.contract (
    id text NOT NULL,
    "contractNumber" integer NOT NULL,
    type public."ContractType" NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    "clientId" text,
    "lessorId" text,
    "lessorType" text,
    "companyId" text NOT NULL,
    "billboardId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contract OWNER TO upside;

--
-- Name: contract_contractNumber_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public."contract_contractNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."contract_contractNumber_seq" OWNER TO upside;

--
-- Name: contract_contractNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public."contract_contractNumber_seq" OWNED BY public.contract."contractNumber";


--
-- Name: deletion; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.deletion (
    id text NOT NULL,
    type public."DeletionType" NOT NULL,
    "recordId" text NOT NULL,
    "isValidate" boolean DEFAULT false NOT NULL,
    "userId" text,
    "companyId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.deletion OWNER TO upside;

--
-- Name: delivery_note; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.delivery_note (
    id text NOT NULL,
    "deliveryNoteNumber" integer NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    note text NOT NULL,
    files text[],
    "pathFiles" text NOT NULL,
    "amountType" public."AmountType" DEFAULT 'TTC'::public."AmountType" NOT NULL,
    "totalHT" numeric(15,2) DEFAULT 0 NOT NULL,
    discount text NOT NULL,
    "discountType" text NOT NULL,
    "paymentLimit" text NOT NULL,
    "totalTTC" numeric(15,2) DEFAULT 0 NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "fromRecordReference" text DEFAULT ''::text NOT NULL,
    "fromRecordId" text DEFAULT ''::text NOT NULL,
    "fromRecordName" text DEFAULT ''::text NOT NULL,
    "createdById" text,
    "clientId" text,
    "projectId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.delivery_note OWNER TO upside;

--
-- Name: delivery_note_deliveryNoteNumber_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public."delivery_note_deliveryNoteNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."delivery_note_deliveryNoteNumber_seq" OWNER TO upside;

--
-- Name: delivery_note_deliveryNoteNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public."delivery_note_deliveryNoteNumber_seq" OWNED BY public.delivery_note."deliveryNoteNumber";


--
-- Name: dibursement; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.dibursement (
    id text NOT NULL,
    type public."TransactionType" DEFAULT 'DISBURSEMENT'::public."TransactionType" NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    reference integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    movement public."BankTransaction" DEFAULT 'OUTFLOWS'::public."BankTransaction" NOT NULL,
    "categoryId" text NOT NULL,
    "natureId" text NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    "amountType" public."AmountType" DEFAULT 'HT'::public."AmountType" NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    "paymentType" text NOT NULL,
    "checkNumber" text,
    "referenceInvoiceId" text,
    "referencePurchaseOrderId" text,
    "allocationId" text,
    "sourceId" text,
    "payOnBehalfOfId" text,
    description text,
    comment text,
    "companyId" text NOT NULL,
    "clientId" text,
    "projectId" text,
    "fiscalObjectId" text,
    "paymentId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.dibursement OWNER TO upside;

--
-- Name: dibursement_data; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.dibursement_data (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    category text NOT NULL,
    nature text NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    "amountType" public."AmountType" DEFAULT 'HT'::public."AmountType" NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    "paymentType" text NOT NULL,
    "checkNumber" text,
    "purchaseOrder" text,
    allocation text,
    source text,
    "payOnBehalfOf" text,
    description text,
    comment text,
    client text,
    supplier text,
    project text,
    "fiscalObject" text,
    "isPaid" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.dibursement_data OWNER TO upside;

--
-- Name: dibursement_reference_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public.dibursement_reference_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dibursement_reference_seq OWNER TO upside;

--
-- Name: dibursement_reference_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public.dibursement_reference_seq OWNED BY public.dibursement.reference;


--
-- Name: display_board; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.display_board (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.display_board OWNER TO upside;

--
-- Name: fiscal_object; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.fiscal_object (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.fiscal_object OWNER TO upside;

--
-- Name: invoice; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.invoice (
    id text NOT NULL,
    "invoiceNumber" integer NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    note text NOT NULL,
    files text[],
    "pathFiles" text NOT NULL,
    "totalHT" numeric(15,2) DEFAULT 0 NOT NULL,
    discount text NOT NULL,
    "discountType" text NOT NULL,
    "paymentLimit" text NOT NULL,
    "totalTTC" numeric(15,2) DEFAULT 0 NOT NULL,
    payee numeric(15,2) DEFAULT 0 NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "amountType" public."AmountType" DEFAULT 'TTC'::public."AmountType" NOT NULL,
    "createdById" text,
    "clientId" text,
    "fromRecordReference" text DEFAULT ''::text NOT NULL,
    "fromRecordId" text DEFAULT ''::text NOT NULL,
    "fromRecordName" text DEFAULT ''::text NOT NULL,
    "projectId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice OWNER TO upside;

--
-- Name: invoice_invoiceNumber_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public."invoice_invoiceNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."invoice_invoiceNumber_seq" OWNER TO upside;

--
-- Name: invoice_invoiceNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public."invoice_invoiceNumber_seq" OWNED BY public.invoice."invoiceNumber";


--
-- Name: item; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.item (
    id text NOT NULL,
    reference text DEFAULT ''::text NOT NULL,
    state public."ItemState" DEFAULT 'APPROVED'::public."ItemState" NOT NULL,
    "hasTax" boolean DEFAULT false NOT NULL,
    name text NOT NULL,
    description text,
    quantity double precision NOT NULL,
    price numeric(15,2) DEFAULT 0 NOT NULL,
    "updatedPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    discount text NOT NULL,
    "discountType" text NOT NULL,
    currency text NOT NULL,
    "itemType" text NOT NULL,
    "locationStart" timestamp(3) without time zone NOT NULL,
    "locationEnd" timestamp(3) without time zone NOT NULL,
    "itemInvoiceType" public."ItemInvoiceType" DEFAULT 'INVOICES'::public."ItemInvoiceType" NOT NULL,
    "invoiceId" text,
    "quoteId" text,
    "billboardId" text,
    "productServiceId" text,
    "purchaseOrderId" text,
    "deliveryNoteId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.item OWNER TO upside;

--
-- Name: lessor_type; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.lessor_type (
    id text NOT NULL,
    type public."LessorSpace" DEFAULT 'PRIVATE'::public."LessorSpace" NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.lessor_type OWNER TO upside;

--
-- Name: notification; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.notification (
    id text NOT NULL,
    type public."NotificationType" DEFAULT 'ALERT'::public."NotificationType" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "for" public."NotificationKindOf" NOT NULL,
    "receiptId" text,
    "dibursementId" text,
    "invoiceId" text,
    "quoteId" text,
    "deliveryNoteId" text,
    "purchaseOrderId" text,
    "appointmentId" text,
    "projectId" text,
    "taskId" text,
    "userId" text,
    "companyId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    message text,
    "paymentDibursementId" text
);


ALTER TABLE public.notification OWNER TO upside;

--
-- Name: notification_read; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.notification_read (
    id text NOT NULL,
    "notificationId" text NOT NULL,
    "userId" text NOT NULL,
    "readAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_read OWNER TO upside;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.payment (
    id text NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    "paymentMode" text NOT NULL,
    infos text,
    "invoiceId" text,
    "purchaseOrderId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment OWNER TO upside;

--
-- Name: permission; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.permission (
    id text NOT NULL,
    "profileId" text NOT NULL,
    resource public."Resource" NOT NULL,
    actions public."Action"[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permission OWNER TO upside;

--
-- Name: product_service; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.product_service (
    id text NOT NULL,
    type public."ProductServiceType" DEFAULT 'PRODUCT'::public."ProductServiceType" NOT NULL,
    "hasTax" boolean DEFAULT false NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    reference text NOT NULL,
    category text NOT NULL,
    designation text NOT NULL,
    description text NOT NULL,
    "unitPrice" numeric(15,2) DEFAULT 0 NOT NULL,
    cost numeric(15,2) DEFAULT 0 NOT NULL,
    "unitType" text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_service OWNER TO upside;

--
-- Name: profile; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.profile (
    id text NOT NULL,
    key integer NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role",
    firstname text NOT NULL,
    lastname text NOT NULL,
    image text,
    path text DEFAULT ''::text NOT NULL,
    phone text,
    job text NOT NULL,
    salary text NOT NULL,
    "internalRegulations" text,
    passport text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp(3) without time zone,
    "companyId" text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.profile OWNER TO upside;

--
-- Name: profile_key_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public.profile_key_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_key_seq OWNER TO upside;

--
-- Name: profile_key_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public.profile_key_seq OWNED BY public.profile.key;


--
-- Name: project; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.project (
    id text NOT NULL,
    name text NOT NULL,
    deadline timestamp(3) without time zone NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    "projectInformation" text,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    balance numeric(15,2) DEFAULT 0 NOT NULL,
    files text[],
    path text NOT NULL,
    status public."ProjectStatus" DEFAULT 'BLOCKED'::public."ProjectStatus" NOT NULL,
    "clientId" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.project OWNER TO upside;

--
-- Name: purchase_order; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.purchase_order (
    id text NOT NULL,
    "purchaseOrderNumber" integer NOT NULL,
    note text NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    files text[],
    "pathFiles" text NOT NULL,
    "totalHT" numeric(15,2) DEFAULT 0 NOT NULL,
    discount text NOT NULL,
    "discountType" text NOT NULL,
    "paymentLimit" text NOT NULL,
    "totalTTC" numeric(15,2) DEFAULT 0 NOT NULL,
    payee numeric(15,2) DEFAULT 0 NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "amountType" public."AmountType" DEFAULT 'TTC'::public."AmountType" NOT NULL,
    "createdById" text,
    "supplierId" text,
    "projectId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_order OWNER TO upside;

--
-- Name: purchase_order_purchaseOrderNumber_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public."purchase_order_purchaseOrderNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."purchase_order_purchaseOrderNumber_seq" OWNER TO upside;

--
-- Name: purchase_order_purchaseOrderNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public."purchase_order_purchaseOrderNumber_seq" OWNED BY public.purchase_order."purchaseOrderNumber";


--
-- Name: quote; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.quote (
    id text NOT NULL,
    "quoteNumber" integer NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    note text NOT NULL,
    files text[],
    "pathFiles" text NOT NULL,
    "amountType" public."AmountType" DEFAULT 'TTC'::public."AmountType" NOT NULL,
    "totalHT" numeric(15,2) DEFAULT 0 NOT NULL,
    discount text NOT NULL,
    "discountType" text NOT NULL,
    "paymentLimit" text NOT NULL,
    "totalTTC" numeric(15,2) DEFAULT 0 NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "fromRecordReference" text DEFAULT ''::text NOT NULL,
    "fromRecordId" text DEFAULT ''::text NOT NULL,
    "fromRecordName" text DEFAULT ''::text NOT NULL,
    "createdById" text,
    "clientId" text,
    "projectId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quote OWNER TO upside;

--
-- Name: quote_quoteNumber_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public."quote_quoteNumber_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."quote_quoteNumber_seq" OWNER TO upside;

--
-- Name: quote_quoteNumber_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public."quote_quoteNumber_seq" OWNED BY public.quote."quoteNumber";


--
-- Name: rateLimit; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."rateLimit" (
    id text NOT NULL,
    key text,
    count integer,
    "lastRequest" bigint
);


ALTER TABLE public."rateLimit" OWNER TO upside;

--
-- Name: receipt; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.receipt (
    id text NOT NULL,
    type public."TransactionType" DEFAULT 'RECEIPT'::public."TransactionType" NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    reference integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    movement public."BankTransaction" DEFAULT 'INFLOWS'::public."BankTransaction" NOT NULL,
    "categoryId" text NOT NULL,
    "natureId" text NOT NULL,
    amount numeric(15,2) DEFAULT 0 NOT NULL,
    "amountType" public."AmountType" DEFAULT 'HT'::public."AmountType" NOT NULL,
    "paymentType" text NOT NULL,
    "checkNumber" text,
    "referenceInvoiceId" text,
    "sourceId" text,
    description text,
    comment text,
    "clientId" text,
    "supplierId" text,
    "companyId" text NOT NULL,
    "paymentId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.receipt OWNER TO upside;

--
-- Name: receipt_reference_seq; Type: SEQUENCE; Schema: public; Owner: upside
--

CREATE SEQUENCE public.receipt_reference_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receipt_reference_seq OWNER TO upside;

--
-- Name: receipt_reference_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: upside
--

ALTER SEQUENCE public.receipt_reference_seq OWNED BY public.receipt.reference;


--
-- Name: recurrence; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.recurrence (
    id text NOT NULL,
    repeat text NOT NULL,
    "invoiceId" text,
    "purchaseOrderId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recurrence OWNER TO upside;

--
-- Name: session; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    "impersonatedBy" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.session OWNER TO upside;

--
-- Name: source; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.source (
    id text NOT NULL,
    name text NOT NULL,
    "sourceType" public."SourceType" DEFAULT 'CASH'::public."SourceType" NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.source OWNER TO upside;

--
-- Name: structure_type; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.structure_type (
    id text NOT NULL,
    name text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.structure_type OWNER TO upside;

--
-- Name: supplier; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.supplier (
    id text NOT NULL,
    "companyName" text NOT NULL,
    firstname text NOT NULL,
    "hasDelete" boolean DEFAULT false NOT NULL,
    lastname text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "businessSector" text NOT NULL,
    website text,
    "paidAmount" numeric(15,2) DEFAULT 0 NOT NULL,
    due numeric(15,2) DEFAULT 0 NOT NULL,
    job text DEFAULT ''::text,
    "legalForms" text DEFAULT ''::text NOT NULL,
    capital text DEFAULT '0'::text,
    address text NOT NULL,
    "businessRegistrationNumber" text NOT NULL,
    "taxIdentificationNumber" text NOT NULL,
    discount text NOT NULL,
    "paymentTerms" text NOT NULL,
    information text,
    path text NOT NULL,
    "uploadDocuments" text[],
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.supplier OWNER TO upside;

--
-- Name: task; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.task (
    id text NOT NULL,
    "taskName" text NOT NULL,
    "desc" text NOT NULL,
    path text,
    "time" timestamp(3) without time zone NOT NULL,
    priority public."Priority" DEFAULT 'NORMAL'::public."Priority" NOT NULL,
    comment text NOT NULL,
    file text[],
    status public."ProjectStatus" DEFAULT 'TODO'::public."ProjectStatus" NOT NULL,
    "projectId" text NOT NULL
);


ALTER TABLE public.task OWNER TO upside;

--
-- Name: task_step; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.task_step (
    id text NOT NULL,
    "stepName" text NOT NULL,
    "check" boolean DEFAULT false NOT NULL,
    "taskId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.task_step OWNER TO upside;

--
-- Name: transaction_category; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.transaction_category (
    id text NOT NULL,
    name text NOT NULL,
    type public."TransactionType" DEFAULT 'RECEIPT'::public."TransactionType" NOT NULL,
    "companyId" text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transaction_category OWNER TO upside;

--
-- Name: transaction_nature; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.transaction_nature (
    id text NOT NULL,
    name text NOT NULL,
    "categoryId" text NOT NULL,
    "companyId" text NOT NULL
);


ALTER TABLE public.transaction_nature OWNER TO upside;

--
-- Name: user; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role",
    "emailVerified" boolean NOT NULL,
    "currentCompany" text,
    "currentProfile" text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."user" OWNER TO upside;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: upside
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone
);


ALTER TABLE public.verification OWNER TO upside;

--
-- Name: contract contractNumber; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract ALTER COLUMN "contractNumber" SET DEFAULT nextval('public."contract_contractNumber_seq"'::regclass);


--
-- Name: delivery_note deliveryNoteNumber; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note ALTER COLUMN "deliveryNoteNumber" SET DEFAULT nextval('public."delivery_note_deliveryNoteNumber_seq"'::regclass);


--
-- Name: dibursement reference; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement ALTER COLUMN reference SET DEFAULT nextval('public.dibursement_reference_seq'::regclass);


--
-- Name: invoice invoiceNumber; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice ALTER COLUMN "invoiceNumber" SET DEFAULT nextval('public."invoice_invoiceNumber_seq"'::regclass);


--
-- Name: profile key; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.profile ALTER COLUMN key SET DEFAULT nextval('public.profile_key_seq'::regclass);


--
-- Name: purchase_order purchaseOrderNumber; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order ALTER COLUMN "purchaseOrderNumber" SET DEFAULT nextval('public."purchase_order_purchaseOrderNumber_seq"'::regclass);


--
-- Name: quote quoteNumber; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote ALTER COLUMN "quoteNumber" SET DEFAULT nextval('public."quote_quoteNumber_seq"'::regclass);


--
-- Name: receipt reference; Type: DEFAULT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt ALTER COLUMN reference SET DEFAULT nextval('public.receipt_reference_seq'::regclass);


--
-- Data for Name: _BillboardToDeliveryNote; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_BillboardToDeliveryNote" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _BillboardToInvoice; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_BillboardToInvoice" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _BillboardToQuote; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_BillboardToQuote" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ContractToInvoice; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_ContractToInvoice" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _DeliveryNoteToProductService; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_DeliveryNoteToProductService" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _DibursementToSupplier; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_DibursementToSupplier" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _InvoiceToProductService; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_InvoiceToProductService" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ProductServiceToPurchaseOrder; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_ProductServiceToPurchaseOrder" ("A", "B") FROM stdin;
fd822706-31e8-424d-91ba-345878b60595	ef647642-3d55-4c05-a292-2a7db3e1562b
\.


--
-- Data for Name: _ProductServiceToQuote; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."_ProductServiceToQuote" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
08687b98-42a3-412b-85f6-f017de5ca762	bf29d372633cf614275c7a803ead59c14630573a13649f07d81aa0476abcef50	2025-12-08 15:15:31.280295+01	20251208141515_initiation	\N	\N	2025-12-08 15:15:31.034309+01	1
b00bac97-62e6-4f18-8678-0e24633dc9b5	eb32fdf297d876445376a253bc5b61b6b6de4bcb9a1ab60e58ef798772ec6064	2025-12-15 16:26:55.079811+01	20251215152655	\N	\N	2025-12-15 16:26:55.042622+01	1
b51d2f97-72d1-438f-86a0-4e230f6cfe0a	34ea92573873f46f54a619d738f07fc541124ca0a5f5725f4c641d638f8ea4b7	2025-12-18 16:14:05.948191+01	20251218151405_securisation_des_tables	\N	\N	2025-12-18 16:14:05.485878+01	1
a444615d-2c25-46aa-bab9-a5a8a7a5374a	05ea885f74736ed786b62b3b52045d9df6fbf9efe8b073e68e0174ef855560d4	2025-12-29 11:53:43.278065+01	20251229105343	\N	\N	2025-12-29 11:53:43.274763+01	1
\.


--
-- Data for Name: _project_collaborators; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public._project_collaborators ("A", "B") FROM stdin;
f6413675-5272-4423-91d7-2aaf9553db6d	4b00ba99-93e3-48c2-a066-5bdbd0f2c883
\.


--
-- Data for Name: _task_users; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public._task_users ("A", "B") FROM stdin;
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "updatedAt", "createdAt") FROM stdin;
u65COtnFZVqDDKZgTgrr2ZDiUsWH2PTO	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	credential	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	\N	\N	\N	\N	\N	f0f802bc0855e1789ec5c29401594456:da50ba6655968d1dade068bfdfa728ce43716d2bcc365920441a726869241d2ec11c2c60fdcc0e2f1b4e0a669d2f6eaff075f40c695c93549780048927b178e3	2025-12-08 14:15:37.555	2025-12-08 14:15:37.555
zorBIKbqbSzJHKmrxzanBH4CCR8pY6N6	1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	credential	1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	\N	\N	\N	\N	\N	\N	66441085544480bf3cbd4201330994f2:629babe0b511ca838b8fff231aa540501a752e8862e25a548e3c9c0e0197adc03bd0c8d8e17918b18f4bd4c6afd090fa0977453f03cdaeed43325c55ce9f0e8e	2025-12-08 14:50:19.661	2025-12-08 14:50:19.661
pfhD0Pp41FTYE0ZZOaTRgdx1gq89rETW	bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	credential	bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	\N	\N	\N	\N	\N	\N	b34fbc9743db7429aa6dc08da305a2dd:35c98f8bc1222332fa2f8266058ba254d5722796094bd1844444f766bfb33c274e703f283798ac13fc6ec04b7402a28386c908985b2fd7d7d54a7058b66b0ac9	2025-12-17 07:52:25.999	2025-12-17 07:52:25.999
XCkkXGIDi8CeDDG1QJwZctUqVyVEGMbc	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	credential	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	\N	\N	\N	\N	\N	\N	25cb924ce26c8c6e384ba68f08ccb393:b3bb209d1cd94ebbe7f5819cf7cc34244ca63578d3ff6b7023c1e8ec34ae6c8f37f602fa7ae0878f0eddcf74ba5e3b20234073a65a3bc49e7e36794c2d978236	2025-12-30 13:25:19.226	2025-12-30 13:25:19.226
\.


--
-- Data for Name: allocation; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.allocation (id, name, "companyId", "natureId") FROM stdin;
01KC1X9RPAC3W5RY28Q2Y5PHKE	Réparation panneaux	ffce5ace-7101-4296-be7e-35028d6bbcf9	9b233555-e9a8-459d-9462-1aea4c0bcd90
01KC1XC4GDXGSHGTH1M6QJMKAE	Loyers panneaux	ffce5ace-7101-4296-be7e-35028d6bbcf9	58d10e81-f73c-4bee-a3c7-10593ea21f07
01KDQQ9ZJ7F66PZ9JJ9R1PG0BD	Sandy	ffce5ace-7101-4296-be7e-35028d6bbcf9	6a9b8858-9a3b-461a-84a8-a429fa9f499b
01KDQQNS46M3XHDD9126EFNS8W	TVA	ffce5ace-7101-4296-be7e-35028d6bbcf9	223e4b4a-751a-4830-ba69-ed421f308fb3
01KEBXJ7HZQS5VXQQZPRC91D65	BRANDING	ffce5ace-7101-4296-be7e-35028d6bbcf9	b269c2d4-c260-46ea-98ab-cb31675c4178
01KEBXPHR0XZARQX5PQ4PYNENG	LOCATION DEPOT BZV	ffce5ace-7101-4296-be7e-35028d6bbcf9	2df2d48a-8230-4426-b4c2-a487c1e324e6
01KEBY7SH10RFCJ3H80XQQVAPJ	LOCATION FACADE BACONGO	ffce5ace-7101-4296-be7e-35028d6bbcf9	ebb296a1-ee3f-40b3-8f09-7b3bb754e410
01KEBYDTK89WJ1XK1RGAEJMG4E	honoraire comptable	ffce5ace-7101-4296-be7e-35028d6bbcf9	1445deef-cf90-47e5-97e9-4c7fc2a92ae1
01KEBZ5JKEBHHXJXJP4H3D1A0S	pose drapeau CT	ffce5ace-7101-4296-be7e-35028d6bbcf9	4a5e9e70-8eb0-4a66-b750-a2118dfe0240
01KEBZAAA4G1W5HPD32EW5VHXD	location echafaudage pose drapeaux CT	ffce5ace-7101-4296-be7e-35028d6bbcf9	4a5e9e70-8eb0-4a66-b750-a2118dfe0240
01KEBZFKDH1SY1S0Y9D2FRDT9V	colle bache	ffce5ace-7101-4296-be7e-35028d6bbcf9	b729b572-4e11-4424-ad67-16619c22a4b4
01KEBZN2NN3HVNHHG2Z4HN6YA4	TRANSPORT CHRISTOPHER	ffce5ace-7101-4296-be7e-35028d6bbcf9	cd8af921-f12c-4bcb-bf8a-7fc1e2e5bfcc
01KEBZXKY2R9SQ0F6R2RZQGG06	GAZOIL	ffce5ace-7101-4296-be7e-35028d6bbcf9	863a1872-0ffb-4627-9e06-4db508d54e08
\.


--
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.appointment (id, subject, address, "hasDelete", date, "time", notify, email, path, documents, "teamMemberName", "clientId", "teamMemberId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: area; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.area (id, name, "companyId", "cityId") FROM stdin;
15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Centre-Ville	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
b5a7de7e-d0a3-489e-8cbb-836449ecb07c	M'Pita	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
ff5bdf34-5e5d-47d6-ae14-239a700c834a	Songolo	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
6129d103-bba9-4aba-8fc9-98679541ecab	Gendarmerie	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
8230c20c-c0b3-4128-85a4-3708eec5e134	ex-Bata	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
0a75d193-d5fe-4688-8e13-754b2e53c9a0	Brasserie	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
1254379d-82fd-4966-b6d6-093fe2414526	Centre ville 	6bed2352-3d37-45d8-8e48-595a1533b08f	ebbb89b6-dfd7-43b7-b10a-adf630c8ca34
beabdec8-abc2-4a15-ba48-337fe783dbfe	Côte sauvage	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
e0032b5b-d2ad-42d7-993c-08f26d9e07d5	Aéroport	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
377e985a-93ef-46a5-adf8-a81dcfe1bbca	Ilama	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
4f847ae7-0d70-44e8-8e39-b27cd34e7952	Tchimbamba	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
9c00af03-d3e6-422b-ba00-ae86ab19ce47	Port	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
a0a4fd69-87a2-4b96-8779-4c4f634828b2	BosCongo	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
f0c74563-f538-4387-b455-94eef6979f3f	Zone Industrielle	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
450d495b-81dd-452e-9a67-a6a0a053e254	Quartier périphérique	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
42188fc9-b945-4ed4-ad6c-c0bd7d003d3b	Grand marché	ffce5ace-7101-4296-be7e-35028d6bbcf9	3057f5a3-b57a-42e2-b3c1-60c8fe48074a
\.


--
-- Data for Name: billboard; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.billboard (id, reference, "hasTax", "typeId", "hasDelete", name, locality, "areaId", "visualMarker", "displayBoardId", "cityId", orientation, gmaps, "pathPhoto", "pathBrochure", photos, brochures, "rentalPrice", "installationCost", maintenance, "revenueGenerate", width, height, lighting, "structureTypeId", "panelCondition", "decorativeElement", foundations, electricity, framework, note, "lessorSpaceType", "lessorSupplierId", "lessorTypeId", "lessorName", "lessorAddress", "lessorCity", "lessorPhone", "lessorEmail", "identityCard", capital, niu, "legalForms", rccm, "taxIdentificationNumber", "bankName", rib, iban, "bicSwift", "representativeFirstName", "representativeLastName", "representativeJob", "representativePhone", "representativeEmail", "rentalStartDate", "delayContractStart", "delayContractEnd", "locationPrice", "nonLocationPrice", "rentalPeriod", "paymentMode", "paymentFrequency", "electricitySupply", "specificCondition", "companyId", "clientId", "createdAt", "updatedAt") FROM stdin;
5de3d729-ea1f-484c-bd2b-b51eef73a85c	C-001-A-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Croisement Elaïs A	Carrefour Hôtel Elais	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Boulangerie Pain de Sucre	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	rond-point Kassaï -> Gare Centrale	https://maps.app.goo.gl/X216oSeXq6uRjGbf8	billboard/photo/croisement_elaïs_a_----9a752e39-262f-4a16-af13-80e2bc98c0b9	billboard/brochure/croisement_elaïs_a_----9a752e39-262f-4a16-af13-80e2bc98c0b9	{billboard/photo/croisement_elaïs_a_----9a752e39-262f-4a16-af13-80e2bc98c0b9/1f8d289f-ae92-4e2b-bc6e-1539575ce8d4.jpg}	{billboard/brochure/croisement_elaïs_a_----9a752e39-262f-4a16-af13-80e2bc98c0b9/47ade34b-f403-48e1-9951-151639d93bc9.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Solaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	0.00			\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:31:46.949	2025-12-09 14:31:46.949
18a53f83-628b-4c62-b15f-05be3a252170	C-001-C-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Croisement Elaïs C	Carrefour Hôtel Elais	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Boulangerie Pain de Sucre	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Côte Mondaine -> Av. CDG	https://maps.app.goo.gl/X216oSeXq6uRjGbf8	atlas_congo/billboard/photo/croisement_elaïs_c_----3bpstbb	atlas_congo/billboard/brochure/croisement_elaïs_c_----3bpstbb	{atlas_congo/billboard/photo/croisement_elaïs_c_----3bpstbb/fb3c7b12-4354-4490-82e2-25efa123820c.jpg}	{atlas_congo/billboard/brochure/croisement_elaïs_c_----3bpstbb/0f04b6e3-073c-48f2-ab3c-cdd0788515c7.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Solaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:33:09.113	2025-12-09 14:34:02.187
445ff090-2fae-4223-8d6c-42cff2434646	C-001-B-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Croisement Elaïs B	Carrefour Hôtel Elais	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Boulangerie Pain de Sucre	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Gare Centrale -> rond-point Kassaï 	https://maps.app.goo.gl/X216oSeXq6uRjGbf8	atlas_congo/billboard/photo/croisement_elaïs_b_----z9o325z	atlas_congo/billboard/brochure/croisement_elaïs_b_----z9o325z	{atlas_congo/billboard/photo/croisement_elaïs_b_----z9o325z/c642b9f6-7906-4356-83ae-f54d5fcad8b5.jpg}	{atlas_congo/billboard/brochure/croisement_elaïs_b_----z9o325z/8bf0628d-f894-42ea-bbdc-7c7341e1a814.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Solaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:31:54.355	2025-12-09 14:34:23.265
83885749-8aaf-4103-9903-bbf126141846	C-003-B-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Guenin B	Route de Songolo	ff5bdf34-5e5d-47d6-ae14-239a700c834a	Magasin Igloo Surgelais	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	31 Juillet -> Raffinerie	https://maps.app.goo.gl/HK8oqvaXxJj1BaraA	atlas_congo/billboard/photo/guenin_b_----7m3d9e3	atlas_congo/billboard/brochure/guenin_b_----7m3d9e3	{atlas_congo/billboard/photo/guenin_b_----7m3d9e3/f50f7f21-30fb-4236-bbd4-4294cdb9a5fb.jpg}	{atlas_congo/billboard/brochure/guenin_b_----7m3d9e3/f33a150f-652a-4c5b-859b-94c74fd7f6ca.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:44:00.876	2025-12-09 14:51:32.722
79793377-0fd8-4a83-bad7-c27b29f02fb7	C-002-B-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	M'pita B	Route de M'pita	b5a7de7e-d0a3-489e-8cbb-836449ecb07c	Rond-point M'Pita	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	SN Plasco -> Brasserie de la mer 	https://maps.app.goo.gl/NiMmmg2yzFvdZrKbA	atlas_congo/billboard/photo/m'pita_b_----zxgt2cg	atlas_congo/billboard/brochure/m'pita_b_----zxgt2cg	{atlas_congo/billboard/photo/m'pita_b_----zxgt2cg/de6cf187-be03-4164-922d-d890da457f69.jpg}	{atlas_congo/billboard/brochure/m'pita_b_----zxgt2cg/2dc160d5-6e6a-407f-8c6e-1651f52e833f.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:39:09.203	2025-12-09 14:43:29.274
47635e9a-1ac2-4ec9-aec6-d301e64557ca	C-003-A-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Guenin A	Route de Songolo	ff5bdf34-5e5d-47d6-ae14-239a700c834a	Magasin Igloo Surgelais	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	31 Juillet -> Raffinerie	https://maps.app.goo.gl/HK8oqvaXxJj1BaraA	atlas_congo/billboard/photo/guenin_a_----vabfx8j	atlas_congo/billboard/brochure/guenin_a_----vabfx8j	{atlas_congo/billboard/photo/guenin_a_----vabfx8j/a57219ff-4ddc-46a9-9de5-5b94cbc41159.jpg}	{atlas_congo/billboard/brochure/guenin_a_----vabfx8j/ed43a0f7-9965-4756-ae5d-89a4194c342d.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:39:54.719	2025-12-09 14:51:09.717
3a8bc170-4c2c-43fe-9fef-6ae689ce9363	C-002-A-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	M'pita A	Route de M'pita	b5a7de7e-d0a3-489e-8cbb-836449ecb07c	Rond-point M'Pita	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Brasserie de la mer -> SN Plasco	https://maps.app.goo.gl/NiMmmg2yzFvdZrKbA	atlas_congo/billboard/photo/m'pita_a_----92dseie	atlas_congo/billboard/brochure/m'pita_a_----92dseie	{atlas_congo/billboard/photo/m'pita_a_----92dseie/daa6f796-056d-4ca9-8f0b-8ab98d68d450.jpg}	{atlas_congo/billboard/brochure/m'pita_a_----92dseie/624a41e1-ea9a-43ef-a8df-abffbca2f5a7.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:35:37.022	2025-12-09 14:43:48.765
b27b9fb2-a025-45be-9ac0-82537428c98c	C-004-A-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Charlemagne A	Av. Emmanuel Dadet	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Ecole primaire francaise	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Av. CDG -> 31 Juillet	https://maps.app.goo.gl/7nY3gahtW7sbbRpeA	atlas_congo/billboard/photo/charlemagne_a_----eb7r5wh	atlas_congo/billboard/brochure/charlemagne_a_----eb7r5wh	{atlas_congo/billboard/photo/charlemagne_a_----eb7r5wh/0ae774a7-f2e6-4e40-bde6-35edc7774c21.jpg}	{atlas_congo/billboard/brochure/charlemagne_a_----eb7r5wh/1cca0202-f084-415b-8136-505cb1216353.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:47:51.346	2025-12-09 14:51:57.498
520b8bd4-b648-4d50-82de-56cb084f4fcd	Q-1002-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Garnison A	Av. Linguissi Tchicaya	6129d103-bba9-4aba-8fc9-98679541ecab	Camp de Gendarmerie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Centre hippique -> Rond-point ex-Bata	https://maps.app.goo.gl/6BM2CE8rQWcCs17i9	atlas_congo/billboard/photo/garnison_a_----a6q0ysf	atlas_congo/billboard/brochure/garnison_a_----a6q0ysf	{atlas_congo/billboard/photo/garnison_a_----a6q0ysf/54b59670-1dad-41c2-b953-5f247bd47a44.jpg}	{atlas_congo/billboard/brochure/garnison_a_----a6q0ysf/dc0b05ab-e889-490c-8a85-0c802a1d845a.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:06:42.145	2025-12-09 15:08:28.685
362ee74d-71ba-4b5f-bac5-65185b84bfe9	C-004-B-PNR	t	34d4f832-67ec-4ca3-8e55-f118b0d2f962	f	Charlemagne B	Av. Emmanuel Dadet	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Ecole primaire francaise	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Av. CDG -> 31 Juillet	https://maps.app.goo.gl/7nY3gahtW7sbbRpeA	atlas_congo/billboard/photo/charlemagne_b_----hb944rm	atlas_congo/billboard/brochure/charlemagne_b_----hb944rm	{atlas_congo/billboard/photo/charlemagne_b_----hb944rm/ca917b27-0f1a-41ba-b81c-e65d78c4e29b.jpg}	{atlas_congo/billboard/brochure/charlemagne_b_----hb944rm/6b0b868e-c72e-4ff9-a513-494c9ae39161.pdf}	180000.00	400000.00	100000.00	0.00	4	5	Non éclairé	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Ok	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:52:02.99	2025-12-09 14:52:40.862
b47fbc00-b69c-46bc-8a82-73860bf74ad3	Q-1001-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Maison d'arret B	Av. Linguissi Tchicaya	6129d103-bba9-4aba-8fc9-98679541ecab	Camp de Gendarmerie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point ex-Bata -> centre hippique	https://maps.app.goo.gl/YZE3J44XFCHXDBQN7	atlas_congo/billboard/photo/maison_d'arret_b_----ga0x4r7	atlas_congo/billboard/brochure/maison_d'arret_b_----ga0x4r7	{atlas_congo/billboard/photo/maison_d'arret_b_----ga0x4r7/0cfddce3-1337-40a1-8519-a51d9dafef59.jpg}	{atlas_congo/billboard/brochure/maison_d'arret_b_----ga0x4r7/a1c899dd-b5b8-4add-b23e-f07233a1c1d7.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 14:55:25.442	2025-12-09 15:09:25.058
b5666f8e-9a61-4530-a251-3c6406d9276c	Q-1001-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Maison d'arret B	Av. Linguissi Tchicaya	6129d103-bba9-4aba-8fc9-98679541ecab	Camp de Gendarmerie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Centre hippique -> Rond-point ex-Bata	https://maps.app.goo.gl/YZE3J44XFCHXDBQN7	atlas_congo/billboard/photo/maison_d'arret_b_----z5s03tq	atlas_congo/billboard/brochure/maison_d'arret_b_----z5s03tq	{atlas_congo/billboard/photo/maison_d'arret_b_----z5s03tq/cfa2b278-39da-461b-90f6-4d0978499c58.jpg}	{atlas_congo/billboard/brochure/maison_d'arret_b_----z5s03tq/a7cd3b92-fb19-4813-8c4d-42aa30dd40ce.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:04:50.283	2025-12-09 15:09:10.462
b41a4735-1dfd-4189-a0c9-1cf48a9465a1	Q-1002-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Garnison B	Av. Linguissi Tchicaya	6129d103-bba9-4aba-8fc9-98679541ecab	Camp de Gendarmerie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point ex-Bata -> Centre hippique	https://maps.app.goo.gl/6BM2CE8rQWcCs17i9	atlas_congo/billboard/photo/garnison_b_----wjq8mlu	atlas_congo/billboard/brochure/garnison_b_----wjq8mlu	{atlas_congo/billboard/photo/garnison_b_----wjq8mlu/a6448f4b-658c-466b-8378-518043f0a385.jpg}	{atlas_congo/billboard/brochure/garnison_b_----wjq8mlu/dc0b05ab-e889-490c-8a85-0c802a1d845a.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:09:32.727	2025-12-09 15:13:45.563
4896b799-69c6-4787-914e-3e823b84ca36	Q-1015-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Ilama	Route secondaire de l'aéroport	377e985a-93ef-46a5-adf8-a81dcfe1bbca	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Château d'eau -> Aéroport   	https://maps.app.goo.gl/eiF1Sn1sCuS1Vzzq6	atlas_congo/billboard/photo/ilama_----fdz6wb1	atlas_congo/billboard/brochure/ilama_----fdz6wb1	{}	{atlas_congo/billboard/brochure/ilama_----fdz6wb1/23f67fc3-028d-4bd6-ae7b-be81cbc0694b.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:51:46.461	2025-12-17 08:52:29.931
5d965b6c-60d4-4325-9aeb-9902498b9780	Q-1003-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cadastre A	Av. Marien Ngouabi	8230c20c-c0b3-4128-85a4-3708eec5e134	Rond-Point Ex-Bata (Cadastre)	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point ex-Bata -> Davoum	https://maps.app.goo.gl/pkJcgzum4zXvt8Ns8	atlas_congo/billboard/photo/cadastre_a_----ovhtp0q	atlas_congo/billboard/brochure/cadastre_a_----ovhtp0q	{atlas_congo/billboard/photo/cadastre_a_----ovhtp0q/9359aa0a-9689-4cd9-949e-32da89fe1548.jpg}	{atlas_congo/billboard/brochure/cadastre_a_----ovhtp0q/f449311c-8c5c-41e1-b034-7ad2555806a8.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:09:38.614	2025-12-09 15:13:25.572
b5e21a51-3577-4e92-a20c-7a97b1156e69	Q-1004-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Club hippique B	Route de l'aéroport	6129d103-bba9-4aba-8fc9-98679541ecab	Club Hippique	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	ex-Bata -> Rond-point Club Hippique	https://maps.app.goo.gl/epoRzJrQf8J26LUz6	atlas_congo/billboard/photo/club_hippique_b_----u6b6pq0	atlas_congo/billboard/brochure/club_hippique_b_----u6b6pq0	{atlas_congo/billboard/photo/club_hippique_b_----u6b6pq0/cd52ae20-567b-496f-a398-a76b8ad1aca5.jpg}	{atlas_congo/billboard/brochure/club_hippique_b_----u6b6pq0/efcc1c6e-d86e-47e7-adc6-127b4b1451a7.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:18:17.328	2025-12-09 15:19:12.73
3d680838-06b9-44ca-8d5f-ee12cd12a272	Q-1003-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cadastre B	Av. Marien Ngouabi	8230c20c-c0b3-4128-85a4-3708eec5e134	Rond-Point Ex-Bata (Cadastre)	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Davoum -> Rond-point ex-Bata	https://maps.app.goo.gl/pkJcgzum4zXvt8Ns8	atlas_congo/billboard/photo/cadastre_b_----0nilmnv	atlas_congo/billboard/brochure/cadastre_b_----0nilmnv	{atlas_congo/billboard/photo/cadastre_b_----0nilmnv/2a8ddc54-c2aa-40ee-9a94-579c84cac9ed.jpg}	{atlas_congo/billboard/brochure/cadastre_b_----0nilmnv/f449311c-8c5c-41e1-b034-7ad2555806a8.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:13:50.199	2025-12-09 15:14:30.537
5ab87fa9-ec82-4323-a8d7-ed1e76019b40	Q-1004-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Club hippique A	Route de l'aéroport	6129d103-bba9-4aba-8fc9-98679541ecab	Club Hippique	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point Club Hippique -> ex-Bata	https://maps.app.goo.gl/epoRzJrQf8J26LUz6	atlas_congo/billboard/photo/club_hippique_a_----dxp8zp6	atlas_congo/billboard/brochure/club_hippique_a_----dxp8zp6	{atlas_congo/billboard/photo/club_hippique_a_----dxp8zp6/8d60507f-1536-4249-9ee0-a2875dfe7c01.jpg}	{atlas_congo/billboard/brochure/club_hippique_a_----dxp8zp6/55c8b126-0b76-4b53-bbbc-79cecd53c5a0.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:14:52.663	2025-12-09 15:18:13.136
8b5d92f7-8330-4e74-a224-234f78c805fa	Q-1005-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	La Pointe A	Av. Linguissi Tchicaya	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Entre ex-ENI et BCI	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point ex-Bata -> Av. CDG	https://maps.app.goo.gl/s9t1sBjpRKjfaJGAA	atlas_congo/billboard/photo/la_pointe_a_----kzzpcox	atlas_congo/billboard/brochure/la_pointe_a_----kzzpcox	{atlas_congo/billboard/photo/la_pointe_a_----kzzpcox/2d4da2ac-7467-42c1-a555-d7cb92f9d6ab.jpg}	{atlas_congo/billboard/brochure/la_pointe_a_----kzzpcox/a47475cb-2d80-45f5-8dfd-1bb8665a582f.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:19:32.382	2025-12-09 15:23:06.618
0ef7e43e-4db7-4215-b57e-d7e098f42e40	Q-1005-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	La Pointe B	Av. Linguissi Tchicaya	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Entre ex-ENI et BCI	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Av. CDG -> Rond-point ex-Bata	https://maps.app.goo.gl/s9t1sBjpRKjfaJGAA	atlas_congo/billboard/photo/la_pointe_b_----fiehjvn	atlas_congo/billboard/brochure/la_pointe_b_----fiehjvn	{atlas_congo/billboard/photo/la_pointe_b_----fiehjvn/3033494f-a7bd-4b01-8609-1d9147ec63ab.jpg}	{atlas_congo/billboard/brochure/la_pointe_b_----fiehjvn/6a120565-c7ee-4db2-81f0-bc762ca44cca.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:23:11.95	2025-12-09 15:23:59.132
440774fa-a959-4d1b-80a4-930b8f931488	Q-1006-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Tractafric A	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	100m du rond-point Tractafric	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	rond-point Tractafric -> Gare Centrale	https://maps.app.goo.gl/gyiTEkkSQJwVDwvx9	atlas_congo/billboard/photo/tractafric_a_----vrh6hpn	atlas_congo/billboard/brochure/tractafric_a_----vrh6hpn	{atlas_congo/billboard/photo/tractafric_a_----vrh6hpn/6fec72db-fa77-4af2-ba3b-26664aa7da10.jpg}	{atlas_congo/billboard/brochure/tractafric_a_----vrh6hpn/159871b7-9f35-4486-9e1e-e9b5fc7ee8a5.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:24:10.437	2025-12-09 15:28:03.776
58027251-b31e-4476-9c8d-754276bb2aaa	Q-1006-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Tractafric B	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	100m du rond-point Tractafric	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Gare Centrale -> rond-point Tractafric 	https://maps.app.goo.gl/gyiTEkkSQJwVDwvx9	atlas_congo/billboard/photo/tractafric_b_----roagigj	atlas_congo/billboard/brochure/tractafric_b_----roagigj	{atlas_congo/billboard/photo/tractafric_b_----roagigj/8e7df547-2c95-4bd4-acc9-aabd7bdb0dd6.jpg}	{atlas_congo/billboard/brochure/tractafric_b_----roagigj/159871b7-9f35-4486-9e1e-e9b5fc7ee8a5.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-09 15:28:07.926	2025-12-09 15:28:41.854
4d9a7aeb-8301-4597-a53b-f4c218057d9e	Q-1007-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Electra	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	100m du rond-point de la Gare Centrale	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	rond-point Tractafric  ->  Gare Centrale	https://maps.app.goo.gl/3tPooUmafB4sQ4AV9	atlas_congo/billboard/photo/electra_----brjf7qm	atlas_congo/billboard/brochure/electra_----brjf7qm	{}	{atlas_congo/billboard/brochure/electra_----brjf7qm/36356e0b-7273-4d9b-8142-30c6d6ea695f.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:26:22.507	2025-12-17 08:28:21.871
bb371fd7-c22e-45ba-82a3-9f9466cab387	Q-1007-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Electra	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	100m du rond-point de la Gare Centrale	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Gare Centrale -> rond-point Tractafric 	https://maps.app.goo.gl/3tPooUmafB4sQ4AV9	atlas_congo/billboard/photo/electra_----fu0zcl2	atlas_congo/billboard/brochure/electra_----fu0zcl2	{}	{atlas_congo/billboard/brochure/electra_----fu0zcl2/5c921245-b3a4-4dc7-bb60-b405922bae30.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:23:36.703	2025-12-17 08:27:25.05
52acada9-619c-4654-9898-20236251181b	Q-1008-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Gare Centrale	Rail de la Mairie	beabdec8-abc2-4a15-ba48-337fe783dbfe	Passage a niveau derrière la Gare	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	rond-point de la Gare  -> Côte sauvage  	https://maps.app.goo.gl/5FUMhyqihzVDkX6M8	atlas_congo/billboard/photo/gare_centrale_----8qfidsg	atlas_congo/billboard/brochure/gare_centrale_----8qfidsg	{}	{atlas_congo/billboard/brochure/gare_centrale_----8qfidsg/f54cb1bd-28ce-42ea-8143-971ac74773c0.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:31:22.354	2025-12-17 08:39:00.251
3696c3dc-3d70-4286-9426-db8847c40a0c	Q-1008-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Gare Centrale	Rail de la Mairie	beabdec8-abc2-4a15-ba48-337fe783dbfe	Passage a niveau derrière la Gare	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Côte sauvage  ->  rond-point de la Gare	https://maps.app.goo.gl/5FUMhyqihzVDkX6M8	atlas_congo/billboard/photo/gare_centrale_----4cdesg7	atlas_congo/billboard/brochure/gare_centrale_----4cdesg7	{}	{atlas_congo/billboard/brochure/gare_centrale_----4cdesg7/77e63bc4-f224-4f9f-b6ba-2fd2a555fc0c.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:28:42.504	2025-12-17 08:39:13.14
7daefa6e-aec6-4c7b-948e-639efd98d1a3	Q-1009-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sophia Beach	Cote sauvage	beabdec8-abc2-4a15-ba48-337fe783dbfe	A la fin du goudron (Casa Papaya)	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Casa Papaya -> Villa Madiba  	https://maps.app.goo.gl/N7cUyVfoGFTG49j87	atlas_congo/billboard/photo/sophia_beach_----rnqs5l7	atlas_congo/billboard/brochure/sophia_beach_----rnqs5l7	{}	{atlas_congo/billboard/brochure/sophia_beach_----rnqs5l7/c01e65db-29cb-4af5-8ec8-36bccb7bf225.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:35:07.614	2025-12-17 08:38:07.063
d3fa4f9c-2d60-4f4a-a639-8461b8326c2f	Q-1009-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sophia Beach	Cote sauvage	beabdec8-abc2-4a15-ba48-337fe783dbfe	A la fin du goudron (Casa Papaya)	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Villa Madiba  -> Casa Papaya	https://maps.app.goo.gl/N7cUyVfoGFTG49j87	atlas_congo/billboard/photo/sophia_beach_----ilu4x2o	atlas_congo/billboard/brochure/sophia_beach_----ilu4x2o	{}	{atlas_congo/billboard/brochure/sophia_beach_----ilu4x2o/c01e65db-29cb-4af5-8ec8-36bccb7bf225.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:32:43.029	2025-12-17 08:38:40.411
c596f119-550e-46cb-899e-7d9d083559e3	Q-1010-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Usine Brasco	Route de l'aéroport	0a75d193-d5fe-4688-8e13-754b2e53c9a0	100m avant la brasserie du Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Club hippique -> Aéroport	https://maps.app.goo.gl/UY1FtzEnXh3pTDC76	atlas_congo/billboard/photo/usine_brasco_----cjb3ijp	atlas_congo/billboard/brochure/usine_brasco_----cjb3ijp	{}	{atlas_congo/billboard/brochure/usine_brasco_----cjb3ijp/11a8404f-9407-4398-bb07-91d76eee11b3.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:35:37.575	2025-12-17 08:40:10.187
2200fcc9-0af7-4a9e-8b55-711050cb7945	Q-1010-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Usine Brasco	Route de l'aéroport	0a75d193-d5fe-4688-8e13-754b2e53c9a0	100m avant la brasserie du Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Aéroport  -> Club hippique	https://maps.app.goo.gl/UY1FtzEnXh3pTDC76	atlas_congo/billboard/photo/usine_brasco_----0j9n5s1	atlas_congo/billboard/brochure/usine_brasco_----0j9n5s1	{}	{atlas_congo/billboard/brochure/usine_brasco_----0j9n5s1/11a8404f-9407-4398-bb07-91d76eee11b3.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:40:17.474	2025-12-17 08:40:39.877
d2f365e3-7c46-4295-831c-310c91dcc00e	Q-1011-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Puma aéroport	Route de l'aéroport	0a75d193-d5fe-4688-8e13-754b2e53c9a0	100m avant la brasserie du Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Aéroport  -> Club hippique	https://maps.app.goo.gl/ebe3QXhhckGw9HUp9	atlas_congo/billboard/photo/puma_aéroport_----n170e9a	atlas_congo/billboard/brochure/puma_aéroport_----n170e9a	{}	{atlas_congo/billboard/brochure/puma_aéroport_----n170e9a/c3ddedec-7508-4b6b-85cd-94f72365c60e.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:40:45.353	2025-12-17 08:41:59.015
a1c17579-ef11-4fb4-bcb2-2eea05588f1b	Q-1011-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Puma aéroport	Route de l'aéroport	0a75d193-d5fe-4688-8e13-754b2e53c9a0	100m avant la brasserie du Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Club hippique -> Aéroport   	https://maps.app.goo.gl/ebe3QXhhckGw9HUp9	atlas_congo/billboard/photo/puma_aéroport_----68st8sf	atlas_congo/billboard/brochure/puma_aéroport_----68st8sf	{}	{atlas_congo/billboard/brochure/puma_aéroport_----68st8sf/c3ddedec-7508-4b6b-85cd-94f72365c60e.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:42:05.47	2025-12-17 08:42:41.754
5f14f95e-7fdd-4e49-aea4-8ef73f480e17	Q-1012-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	SMT Volvo	Route de l'aéroport	e0032b5b-d2ad-42d7-993c-08f26d9e07d5	200m après la station Total M'Pita	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Club hippique -> Aéroport   	https://maps.app.goo.gl/rJ51HgLEHjQSNdLTA	atlas_congo/billboard/photo/smt_volvo_----xd4i41b	atlas_congo/billboard/brochure/smt_volvo_----xd4i41b	{}	{atlas_congo/billboard/brochure/smt_volvo_----xd4i41b/32fb83b8-957c-4b15-8066-0233f6e6eab7.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:42:47.267	2025-12-17 08:45:01.265
d890248d-4470-4135-b5d9-373f74d52d42	Q-1012-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	SMT Volvo	Route de l'aéroport	e0032b5b-d2ad-42d7-993c-08f26d9e07d5	200m après la station Total M'Pita	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Aéroport -> Club hippique 	https://maps.app.goo.gl/rJ51HgLEHjQSNdLTA	atlas_congo/billboard/photo/smt_volvo_----a6uxn0v	atlas_congo/billboard/brochure/smt_volvo_----a6uxn0v	{}	{atlas_congo/billboard/brochure/smt_volvo_----a6uxn0v/32fb83b8-957c-4b15-8066-0233f6e6eab7.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:45:11.07	2025-12-17 08:46:55.312
9402d862-ab4f-4f09-947a-bbd82f3c14fc	Q-1013-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Agence DHL	Route de l'aéroport	e0032b5b-d2ad-42d7-993c-08f26d9e07d5	100m avant le rond-point de l'aéroport	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Brasserie -> Aéroport 	https://maps.app.goo.gl/H7T381F5oLy8iMXs9	atlas_congo/billboard/photo/agence_dhl_----d0s079d	atlas_congo/billboard/brochure/agence_dhl_----d0s079d	{}	{atlas_congo/billboard/brochure/agence_dhl_----d0s079d/07a0cb35-39f4-493d-b07c-098306676b83.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:47:04.871	2025-12-17 08:48:52.272
63e156c9-db7e-4bc3-88f4-a294cd359778	Q-1013-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Agence DHL	Route de l'aéroport	e0032b5b-d2ad-42d7-993c-08f26d9e07d5	100m avant le rond-point de l'aéroport	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Aéroport  -> Brasserie 	https://maps.app.goo.gl/H7T381F5oLy8iMXs9	atlas_congo/billboard/photo/agence_dhl_----9z7kvlv	atlas_congo/billboard/brochure/agence_dhl_----9z7kvlv	{}	{atlas_congo/billboard/brochure/agence_dhl_----9z7kvlv/07a0cb35-39f4-493d-b07c-098306676b83.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:49:03.006	2025-12-17 08:49:26.204
cbcd8d21-caa9-4910-9896-1c945136c270	Q-1015-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Ilama	Route secondaire de l'aéroport	377e985a-93ef-46a5-adf8-a81dcfe1bbca	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Aéroport  -> Château d'eau 	https://maps.app.goo.gl/eiF1Sn1sCuS1Vzzq6	atlas_congo/billboard/photo/ilama_----debxfl6	atlas_congo/billboard/brochure/ilama_----debxfl6	{}	{atlas_congo/billboard/brochure/ilama_----debxfl6/23f67fc3-028d-4bd6-ae7b-be81cbc0694b.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:49:30.523	2025-12-17 08:51:38.624
fb224039-2df5-46ed-bd21-6b47dd3237fa	Q-1016-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Tchimbamba	Route de Tchimbamba	4f847ae7-0d70-44e8-8e39-b27cd34e7952	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Brasserie -> Ngoyo	https://maps.app.goo.gl/1aUdn6ukvbhXjyjt8	atlas_congo/billboard/photo/tchimbamba_----ning0s9	atlas_congo/billboard/brochure/tchimbamba_----ning0s9	{}	{atlas_congo/billboard/brochure/tchimbamba_----ning0s9/0833f979-b417-4680-9167-82d3f05e5490.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:52:37.25	2025-12-17 08:55:16.56
fd06df0b-0a0c-4de6-bdfc-27aa85b37562	Q-1016-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Tchimbamba	Route de Tchimbamba	4f847ae7-0d70-44e8-8e39-b27cd34e7952	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Ngoyo  -> Brasserie	https://maps.app.goo.gl/1aUdn6ukvbhXjyjt8	atlas_congo/billboard/photo/tchimbamba_----vjm1tq9	atlas_congo/billboard/brochure/tchimbamba_----vjm1tq9	{}	{atlas_congo/billboard/brochure/tchimbamba_----vjm1tq9/0833f979-b417-4680-9167-82d3f05e5490.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:55:28.596	2025-12-17 08:55:49.355
56e1412e-50b5-4aad-b267-eb88ef6272db	Q-1018-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	CFAO Port	Avenue du port	9c00af03-d3e6-422b-ba00-ae86ab19ce47	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Gare centrale -> Port 	https://maps.app.goo.gl/2Kz3QjiWtgqW6AqVA	atlas_congo/billboard/photo/cfao_port_----bt56fhh	atlas_congo/billboard/brochure/cfao_port_----bt56fhh	{}	{atlas_congo/billboard/brochure/cfao_port_----bt56fhh/beb60e93-6b88-481e-9a6a-71ffcc508068.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:58:11.916	2025-12-17 08:58:38.328
db4e59be-1166-4d55-86c6-bb91ef95789e	Q-1018-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	CFAO Port	Avenue du port	9c00af03-d3e6-422b-ba00-ae86ab19ce47	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Port -> Gare centrale  	https://maps.app.goo.gl/2Kz3QjiWtgqW6AqVA	atlas_congo/billboard/photo/cfao_port_----be6lxil	atlas_congo/billboard/brochure/cfao_port_----be6lxil	{}	{atlas_congo/billboard/brochure/cfao_port_----be6lxil/beb60e93-6b88-481e-9a6a-71ffcc508068.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:56:12.222	2025-12-17 08:58:51.526
c061e50c-4445-41fe-97d7-b1f2990d08af	Q-1019-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cactus Negoce	Blv. de Loango	a0a4fd69-87a2-4b96-8779-4c4f634828b2	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Base Total -> Port 	https://maps.app.goo.gl/UhCevv6RwZ84fqta6	atlas_congo/billboard/photo/cactus_negoce_----r0k3pql	atlas_congo/billboard/brochure/cactus_negoce_----r0k3pql	{}	{atlas_congo/billboard/brochure/cactus_negoce_----r0k3pql/fc5e2e30-b2ce-4898-8fa6-2b47fb43f391.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 08:58:56.749	2025-12-17 09:02:12.42
494ee146-18ab-4524-b3a6-41b8b180c0ed	Q-1019-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cactus Negoce	Blv. de Loango	a0a4fd69-87a2-4b96-8779-4c4f634828b2	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Port Base -> Total	https://maps.app.goo.gl/UhCevv6RwZ84fqta6	atlas_congo/billboard/photo/cactus_negoce_----cw5b4i0	atlas_congo/billboard/brochure/cactus_negoce_----cw5b4i0	{}	{atlas_congo/billboard/brochure/cactus_negoce_----cw5b4i0/fc5e2e30-b2ce-4898-8fa6-2b47fb43f391.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:02:17.687	2025-12-17 09:02:37.322
f6b3dce5-160b-4e00-bbfe-9278ecaf00d0	Q-1020-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	BosCongo	Blv. de Loango	a0a4fd69-87a2-4b96-8779-4c4f634828b2	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Port  -> Base Total	https://maps.app.goo.gl/ggQEZRm8G2sbeuaeA	atlas_congo/billboard/photo/boscongo_----axjg3s6	atlas_congo/billboard/brochure/boscongo_----axjg3s6	{}	{atlas_congo/billboard/brochure/boscongo_----axjg3s6/f494df5e-ec56-4813-8c46-b25499044985.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:02:41.056	2025-12-17 09:03:38.761
6e2d4dd0-090b-4b4f-87b3-04dd1020ae2f	Q-1020-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	BosCongo	Blv. de Loango	a0a4fd69-87a2-4b96-8779-4c4f634828b2	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Base Total -> Port  	https://maps.app.goo.gl/ggQEZRm8G2sbeuaeA	atlas_congo/billboard/photo/boscongo_----5b2qanu	atlas_congo/billboard/brochure/boscongo_----5b2qanu	{}	{atlas_congo/billboard/brochure/boscongo_----5b2qanu/f494df5e-ec56-4813-8c46-b25499044985.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:03:44.273	2025-12-17 09:04:04.848
905d9de3-ed73-4ec6-b67d-29ac65e33db8	Q-1021-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sunrise	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point 31 Juillet -> Songolo	https://maps.app.goo.gl/kLKX9sAv2wioQzsH6	atlas_congo/billboard/photo/sunrise_----0x4jeef	atlas_congo/billboard/brochure/sunrise_----0x4jeef	{}	{atlas_congo/billboard/brochure/sunrise_----0x4jeef/5fa293f9-cf45-4f00-bcb2-5f0bbaa4e791.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:13:33.699	2025-12-17 09:17:14.292
1b9f7518-d17a-4a29-89f4-60ccabcba10b	Q-1021-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sunrise	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Songolo -> Rond-point 31 Juillet 	https://maps.app.goo.gl/kLKX9sAv2wioQzsH6	atlas_congo/billboard/photo/sunrise_----m157ael	atlas_congo/billboard/brochure/sunrise_----m157ael	{}	{atlas_congo/billboard/brochure/sunrise_----m157ael/5fa293f9-cf45-4f00-bcb2-5f0bbaa4e791.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:17:22.088	2025-12-17 09:17:43.08
25e25b86-6200-4a89-9b83-ab7f524e137a	Q-1023-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Guenin 1	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point 31 Juillet -> Songolo	https://maps.app.goo.gl/fewTokRLrVYiBPxj7	atlas_congo/billboard/photo/guenin_1_----nrenk3w	atlas_congo/billboard/brochure/guenin_1_----nrenk3w	{}	{atlas_congo/billboard/brochure/guenin_1_----nrenk3w/a8122c2b-d65b-430f-a354-62ccc5e87a00.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 09:57:08.355	2025-12-17 10:00:49.366
18ec7b7b-8bf0-475c-b2d1-513384896c7b	Q-1023-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Guenin 1	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Songolo -> Rond-point 31 Juillet 	https://maps.app.goo.gl/fewTokRLrVYiBPxj7	atlas_congo/billboard/photo/guenin_1_----wzrrs10	atlas_congo/billboard/brochure/guenin_1_----wzrrs10	{}	{atlas_congo/billboard/brochure/guenin_1_----wzrrs10/a8122c2b-d65b-430f-a354-62ccc5e87a00.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:00:54.581	2025-12-17 10:01:13.662
23f1017e-21ad-48de-b8de-a19f1860f569	Q-1024-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Guenin 2	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Songolo -> Rond-point 31 Juillet 	https://maps.app.goo.gl/21FWrCmsA7FwmRWN7	atlas_congo/billboard/photo/guenin_2_----5cu1jjb	atlas_congo/billboard/brochure/guenin_2_----5cu1jjb	{}	{atlas_congo/billboard/brochure/guenin_2_----5cu1jjb/54564510-1660-4c08-8243-b4ff40681fea.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:01:17.734	2025-12-17 10:02:12.892
460c475b-af1f-4f66-ad8c-d64c05953930	Q-1024-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Guenin 2	Av. Jacques Opangault	f0c74563-f538-4387-b455-94eef6979f3f	N.C.	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point 31 Juillet -> Songolo  	https://maps.app.goo.gl/21FWrCmsA7FwmRWN7	atlas_congo/billboard/photo/guenin_2_----jd2sbxk	atlas_congo/billboard/brochure/guenin_2_----jd2sbxk	{}	{atlas_congo/billboard/brochure/guenin_2_----jd2sbxk/54564510-1660-4c08-8243-b4ff40681fea.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:02:17.162	2025-12-17 10:02:38.025
fae8b88c-d6da-4324-bb90-90d8ad73e359	Q-1025-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Alu Congo	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Alu Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Château d'eau -> Rond-point Davum	https://maps.app.goo.gl/B2ZRZ81GA89qnGcU8	atlas_congo/billboard/photo/alu_congo_----watrpyn	atlas_congo/billboard/brochure/alu_congo_----watrpyn	{}	{atlas_congo/billboard/brochure/alu_congo_----watrpyn/938a7129-39c0-4990-8ba1-c3396aef6ce5.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:02:42.525	2025-12-17 10:16:37.42
599d52af-2e2d-4928-a74c-41e73cc7ebbd	Q-1025-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Alu Congo	Av. Marien Ngouabi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Alu Congo	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point Davum -> Château d'eau 	https://maps.app.goo.gl/B2ZRZ81GA89qnGcU8	atlas_congo/billboard/photo/alu_congo_----s137k2a	atlas_congo/billboard/brochure/alu_congo_----s137k2a	{}	{atlas_congo/billboard/brochure/alu_congo_----s137k2a/938a7129-39c0-4990-8ba1-c3396aef6ce5.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:05:17.004	2025-12-17 10:16:28.474
31fe7b44-a15f-4506-96d2-23aa249c4e31	Q-1026-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sueco	Face marché artisanal du stade Ancelmi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Marché artisanal	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Carrefour Park & Shop -> Hôpital A.Cissé 	https://maps.app.goo.gl/YcJFosZWjeAJhYuy5	atlas_congo/billboard/photo/sueco_----36nzyyr	atlas_congo/billboard/brochure/sueco_----36nzyyr	{}	{atlas_congo/billboard/brochure/sueco_----36nzyyr/db3d69bb-75d4-42a4-9957-47560369db0b.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:05:55.212	2025-12-17 10:16:01.719
4ccb1f6c-0253-462e-8018-685679d56b6b	Q-1026-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Sueco	Face marché artisanal du stade Ancelmi	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Marché artisanal	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Hôpital A.Cissé -> Carrefour Park & Shop  	https://maps.app.goo.gl/YcJFosZWjeAJhYuy5	atlas_congo/billboard/photo/sueco_----uzamse2	atlas_congo/billboard/brochure/sueco_----uzamse2	{}	{atlas_congo/billboard/brochure/sueco_----uzamse2/db3d69bb-75d4-42a4-9957-47560369db0b.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:08:51.517	2025-12-17 10:15:52.691
b4008909-7ed2-4aa2-ac8e-a9f1f8da24d1	Q-1028-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Puma KM4	100m avant le carrefour du château d'eau	450d495b-81dd-452e-9a67-a6a0a053e254	Station Puma KM4	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point Davum -> Château d'eau	https://maps.app.goo.gl/xDagxQg68Pqc4EEh7	atlas_congo/billboard/photo/puma_km4_----wo7vfu0	atlas_congo/billboard/brochure/puma_km4_----wo7vfu0	{}	{atlas_congo/billboard/brochure/puma_km4_----wo7vfu0/d176ab93-fe11-4640-acdb-6cb9952962d3.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:12:16.022	2025-12-17 10:14:23.317
d4ea05c0-8a2d-41df-97df-ec624248629f	Q-1028-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Puma KM4	100m avant le carrefour du château d'eau	450d495b-81dd-452e-9a67-a6a0a053e254	Station Puma KM4	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Château d'eau -> Rond-point Davum 	https://maps.app.goo.gl/xDagxQg68Pqc4EEh7	atlas_congo/billboard/photo/puma_km4_----3ykn7vt	atlas_congo/billboard/brochure/puma_km4_----3ykn7vt	{}	{atlas_congo/billboard/brochure/puma_km4_----3ykn7vt/d176ab93-fe11-4640-acdb-6cb9952962d3.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:14:27.215	2025-12-17 10:14:55.077
26d03e5e-bfce-46a3-95dd-7aee62d95b78	Q-1027-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Pharmacie 3M	Carrefour de l'école primaire française	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Pharmacie 3M	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Carrefour Charlemagne Primaire -> Lycée Pointe-Noire 2  	https://maps.app.goo.gl/va51KbjpUHmR5fAG9	atlas_congo/billboard/photo/pharmacie_3m_----1mrhz5f	atlas_congo/billboard/brochure/pharmacie_3m_----1mrhz5f	{}	{atlas_congo/billboard/brochure/pharmacie_3m_----1mrhz5f/37a09dd4-c469-44ae-a816-84a048c4db04.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:11:45.279	2025-12-17 10:15:25.533
16a1c56a-3218-47e7-bb93-8788d40dc370	Q-1027-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Pharmacie 3M	Carrefour de l'école primaire française	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Pharmacie 3M	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Lycée Pointe-Noire 2 -> Carrefour Charlemagne Primaire	https://maps.app.goo.gl/va51KbjpUHmR5fAG9	atlas_congo/billboard/photo/pharmacie_3m_----oltagnb	atlas_congo/billboard/brochure/pharmacie_3m_----oltagnb	{}	{atlas_congo/billboard/brochure/pharmacie_3m_----oltagnb/37a09dd4-c469-44ae-a816-84a048c4db04.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:09:30.315	2025-12-17 10:15:34.641
27cf288c-a36a-4ac3-97f9-23d90c86b47d	Q-1029-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Hôpital A. Cissé	30m de l'hôpital A. Cissé	450d495b-81dd-452e-9a67-a6a0a053e254	Hôpital A. Cissé	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Hôpital A. Cissé -> Sueco	https://maps.app.goo.gl/tHtbPZ2ywdjKMtF3A	atlas_congo/billboard/photo/hôpital_a._cissé_----bfepqof	atlas_congo/billboard/brochure/hôpital_a._cissé_----bfepqof	{}	{atlas_congo/billboard/brochure/hôpital_a._cissé_----bfepqof/d410d5d8-65b0-4df1-8284-08277c874181.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:16:41.731	2025-12-17 10:18:18.837
9e87ff95-5ca3-4801-b57a-8d32ec2896b1	Q-1029-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Hôpital A. Cissé	30m de l'hôpital A. Cissé	450d495b-81dd-452e-9a67-a6a0a053e254	Hôpital A. Cissé	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Sueco -> Hôpital A. Cissé	https://maps.app.goo.gl/tHtbPZ2ywdjKMtF3A	atlas_congo/billboard/photo/hôpital_a._cissé_----nzkveyj	atlas_congo/billboard/brochure/hôpital_a._cissé_----nzkveyj	{}	{atlas_congo/billboard/brochure/hôpital_a._cissé_----nzkveyj/d410d5d8-65b0-4df1-8284-08277c874181.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:18:22.811	2025-12-17 10:19:24.055
bcbb8550-218f-4a56-8f98-5f88ab5c5338	Q-1030-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cours d'appel	Face hôpital A. Cissé	450d495b-81dd-452e-9a67-a6a0a053e254	Hôpital A. Cissé	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Sueco -> Hôpital A. Cissé	https://maps.app.goo.gl/71FV1VKPC8CDjJR27	atlas_congo/billboard/photo/cours_d'appel_----e1kik2f	atlas_congo/billboard/brochure/cours_d'appel_----e1kik2f	{}	{atlas_congo/billboard/brochure/cours_d'appel_----e1kik2f/a74bc8bd-8c5c-45eb-a48b-59fa0ae57d98.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:19:30.676	2025-12-17 10:20:39.305
c4fa8df5-cf24-46c9-840a-a5fb29227849	Q-1030-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Cours d'appel	Face hôpital A. Cissé	450d495b-81dd-452e-9a67-a6a0a053e254	Hôpital A. Cissé	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Hôpital A. Cissé -> Sueco 	https://maps.app.goo.gl/71FV1VKPC8CDjJR27	atlas_congo/billboard/photo/cours_d'appel_----yld8j8y	atlas_congo/billboard/brochure/cours_d'appel_----yld8j8y	{}	{atlas_congo/billboard/brochure/cours_d'appel_----yld8j8y/a74bc8bd-8c5c-45eb-a48b-59fa0ae57d98.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:20:45.802	2025-12-17 10:21:08.595
9278e700-c3ba-45a4-88e0-9170a500d2be	Q-1033-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Lumumba	Av. Meo Kaat Matou	42188fc9-b945-4ed4-ad6c-c0bd7d003d3b	Case du partie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point Lumumba -> rond-point Kassaï 	https://maps.app.goo.gl/q22GD1qmHwMA7xb66	atlas_congo/billboard/photo/lumumba_----57iwrg4	atlas_congo/billboard/brochure/lumumba_----57iwrg4	{}	{atlas_congo/billboard/brochure/lumumba_----57iwrg4/f7722eb0-d429-49da-912a-989f5f96fe21.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:27:59.554	2025-12-17 10:30:47.812
768bdd41-057a-4be2-b113-2998277054fa	Q-1033-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Lumumba	Av. Meo Kaat Matou	42188fc9-b945-4ed4-ad6c-c0bd7d003d3b	Case du partie	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point Kassaï -> rond-point Lumumba	https://maps.app.goo.gl/q22GD1qmHwMA7xb66	atlas_congo/billboard/photo/lumumba_----2tkk18x	atlas_congo/billboard/brochure/lumumba_----2tkk18x	{}	{atlas_congo/billboard/brochure/lumumba_----2tkk18x/f7722eb0-d429-49da-912a-989f5f96fe21.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:30:52.517	2025-12-17 10:31:11.66
5a17f8f4-25be-4b0d-ae4f-6cdef74a1da3	Q-1034-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Mairie Centrale	Blv. du Général De Gaule	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Mairie de Pointe-Noire	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Rond-point MSF -> Kactus Café	https://maps.app.goo.gl/Gmj186HHWQtsFtpv7	atlas_congo/billboard/photo/mairie_centrale_----3fhge6u	atlas_congo/billboard/brochure/mairie_centrale_----3fhge6u	{}	{atlas_congo/billboard/brochure/mairie_centrale_----3fhge6u/cee5e033-05a5-4e9b-b9a5-1329f378b5fa.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:32:01.353	2025-12-17 10:33:12.61
9e61fad9-1c33-4923-bcf6-653912e92599	Q-1034-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Mairie Centrale	Blv. du Général De Gaule	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Mairie de Pointe-Noire	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Kactus Café  -> Rond-point MSF 	https://maps.app.goo.gl/Gmj186HHWQtsFtpv7	atlas_congo/billboard/photo/mairie_centrale_----mbs9wzc	atlas_congo/billboard/brochure/mairie_centrale_----mbs9wzc	{}	{atlas_congo/billboard/brochure/mairie_centrale_----mbs9wzc/cee5e033-05a5-4e9b-b9a5-1329f378b5fa.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:33:17.64	2025-12-17 10:33:39.91
4e28d7c4-8d65-4ef7-b9e9-48405d94bd9d	Q-1037-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Loandjili Commune	Loandjili	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Mairie de Loandjili	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	En allant vers la Mairie de Loandjili	https://maps.app.goo.gl/ZQhfmCe5Hjtyfser6	atlas_congo/billboard/photo/loandjili_commune_----ai80mr8	atlas_congo/billboard/brochure/loandjili_commune_----ai80mr8	{}	{atlas_congo/billboard/brochure/loandjili_commune_----ai80mr8/bb1b2908-026c-441c-8ff7-2ace45661f10.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:33:43.564	2025-12-17 10:36:25.253
803e9445-d8c4-4acd-bd7b-603c0e59d975	Q-1037-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Loandjili Commune	Loandjili	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Mairie de Loandjili	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	En quittant la Mairie de Loandjili	https://maps.app.goo.gl/ZQhfmCe5Hjtyfser6	atlas_congo/billboard/photo/loandjili_commune_----3mi6ezz	atlas_congo/billboard/brochure/loandjili_commune_----3mi6ezz	{}	{atlas_congo/billboard/brochure/loandjili_commune_----3mi6ezz/bb1b2908-026c-441c-8ff7-2ace45661f10.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:36:31.358	2025-12-17 10:36:56.104
97fa116a-26a4-4fa2-9570-7ce393e2ceb8	Q-1038-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Hôpital Loandjili	Loandjili	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Carrefour de Loandjili	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	En allant vers la ville	https://maps.app.goo.gl/RqnSUp28vRGnJQtU7	atlas_congo/billboard/photo/hôpital_loandjili_----aplvwr2	atlas_congo/billboard/brochure/hôpital_loandjili_----aplvwr2	{}	{atlas_congo/billboard/brochure/hôpital_loandjili_----aplvwr2/373cfcab-8410-4575-bcf8-eece9d52fc6f.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:37:07.778	2025-12-17 10:38:38.167
01ddb8e9-6a5e-434e-a0fa-22b27a3a7208	Q-1038-B-PNr	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Hôpital Loandjili	Loandjili	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Carrefour de Loandjili	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	En quittant la ville	https://maps.app.goo.gl/RqnSUp28vRGnJQtU7	atlas_congo/billboard/photo/hôpital_loandjili_----yrcmb23	atlas_congo/billboard/brochure/hôpital_loandjili_----yrcmb23	{}	{atlas_congo/billboard/brochure/hôpital_loandjili_----yrcmb23/373cfcab-8410-4575-bcf8-eece9d52fc6f.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:38:58.851	2025-12-17 10:39:22.021
6da092d1-b113-46db-b81f-c6c3488eb05b	Q-1039-B-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Moulembo	Moulembo	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Paroisse Saint Jean-Bosco	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	N.C.	https://maps.app.goo.gl/S5kY9QZ7V7nH5cjm6	atlas_congo/billboard/photo/moulembo_----w3kqml1	atlas_congo/billboard/brochure/moulembo_----w3kqml1	{}	{atlas_congo/billboard/brochure/moulembo_----w3kqml1/007fdf49-e1e6-4a90-ba4f-437aa08ea090.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:41:31.648	2025-12-17 10:42:03.53
be85abd0-d324-497c-9b00-50b340e35d59	Q-1039-A-PNR	t	62117a79-5a17-4cb5-87c6-187d567083d8	f	Moulembo	Moulembo	15ced7b9-ad77-4aa8-a7a6-4ab43d74b6c6	Paroisse Saint Jean-Bosco	d22af762-88c0-488d-ab53-a0e6d5d2ece6	3057f5a3-b57a-42e2-b3c1-60c8fe48074a	N.C.	https://maps.app.goo.gl/S5kY9QZ7V7nH5cjm6	atlas_congo/billboard/photo/moulembo_----1dh5oae	atlas_congo/billboard/brochure/moulembo_----1dh5oae	{}	{atlas_congo/billboard/brochure/moulembo_----1dh5oae/007fdf49-e1e6-4a90-ba4f-437aa08ea090.pdf}	120000.00	350000.00	100000.00	0.00	4	3	Filaire	321631f3-3e3c-47be-9ba7-7ca4267c5c8c	clean	Ok	Ok	Abimé	Ok	five	public	6525523a-e251-47a6-b02e-993855ef0b7b	be535637-eaaf-4585-9887-9199d31ea4d9	\N	\N	\N	\N	\N	\N	\N	\N		\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	2025-12-17 10:39:34.245	2025-12-19 02:35:54.028
\.


--
-- Data for Name: billboard_type; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.billboard_type (id, name, "companyId") FROM stdin;
34d4f832-67ec-4ca3-8e55-f118b0d2f962	4m x 5m	ffce5ace-7101-4296-be7e-35028d6bbcf9
62117a79-5a17-4cb5-87c6-187d567083d8	4m x 3m	ffce5ace-7101-4296-be7e-35028d6bbcf9
55b9e814-88b9-48b5-95e3-798f3de6af2d	Toile monumentale 	6bed2352-3d37-45d8-8e48-595a1533b08f
4ea224f7-4c6b-4a26-b98b-8313bacd3ce5	Panneau intermédiaire 	6bed2352-3d37-45d8-8e48-595a1533b08f
b685d11c-1209-4da3-8f41-af79e7eff874	Passerelle 	6bed2352-3d37-45d8-8e48-595a1533b08f
b5056068-0dd3-41d9-b725-fe7b1b84ba7a	Panneau grand format au sol 	6bed2352-3d37-45d8-8e48-595a1533b08f
\.


--
-- Data for Name: city; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.city (id, name, "companyId") FROM stdin;
3057f5a3-b57a-42e2-b3c1-60c8fe48074a	Pointe-Noire	ffce5ace-7101-4296-be7e-35028d6bbcf9
ebbb89b6-dfd7-43b7-b10a-adf630c8ca34	Libreville	6bed2352-3d37-45d8-8e48-595a1533b08f
5f3517bf-3dda-4b8e-91e9-bb0a5a26ab33	Franceville 	6bed2352-3d37-45d8-8e48-595a1533b08f
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.client (id, "companyName", lastname, "hasDelete", firstname, email, phone, website, address, path, "paidAmount", due, "businessSector", "businessRegistrationNumber", "taxIdentificationNumber", job, "legalForms", capital, discount, "paymentTerms", information, "uploadDocuments", "companyId", "createdAt", "updatedAt") FROM stdin;
578d8445-753c-46ee-a128-74d6d7b1e597	Simply Black Media	Kena	f	Gift	gift.pebu@simplyblackmedia.com	+27613701605	www.simplyblackmedia.com	54 The Valley Road, Parktown, Johannesburg, Gauteng, 2193, Afrique du Sud	atlas_congo/client/gift_kena	0.00	0.00	publicite_marketing	M2008018151	9748241156	Campaign Manager	PTY LTD	25000000 ZAR	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 08:11:16.027	2025-12-09 08:11:16.027
96fece98-ad5e-485b-a6b3-33cb39e16764	AIRTEL Congo	Bangala	f	Benedicte	benedicte.bangala@cg.airtel.com	+242 05 500 95 16		2ème étage SCI Immeuble Monte Cristo, Rond-Point de la Gare, Brazzaville, Congo	atlas_congo/client/benedicte_bangala	0.00	0.00	technologies_information	CG-BZ-01-1999-B15-00008	M2006110000498173	Brand & Co Manager	SA	86 299 720 000	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:11:56.45	2025-12-09 09:11:56.45
2eeb5eab-a674-4743-a528-c5795063693b	Brasco	Moanda	f	Giovani	giovani.moanda@heineken.com	+242 06 620 74 50		Av. Edith Lucie Bongo Ondimba, Brazzaville, Congo	atlas_congo/client/giovani_moanda	0.00	0.00	agroalimentaire	07-B-790	M2005110000055116	Media, PR & Sponsorship Manager	SA	24 135 748 200	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 07:52:01.043	2025-12-09 09:12:14.912
91ac4430-d20f-44f9-a65f-fe7e4bf58bf1	Africa Global Logistics	H. Kinimbaga	f	Denifa	denifa.kinimbaga@congo-terminal.com	+242 05 206 21 04	www.congo-terminal.net	BP 855, Pointe-Noire, Congo	atlas_congo/client/denifa_h._kinimbaga	0.00	0.00	logistique_transport	CG-PNR-01-1982-B14-01512	M23000000300583E	Assistant Achats	SA	503 295 000	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 08:01:56.77	2025-12-09 09:12:34.329
7d55b56c-3bbb-4db3-a4fa-3697b99a97df	Regal	Punjabi	f	Kiran	regalmarketing@regal-congo.com	+242 05 762 89 88	www.regal-congo.com	Av. Moé Vangoula, Evêché, BP : 603, Pointe-Noire, Congo	atlas_congo/client/kiran_punjabi	0.00	0.00	alimentaire	CG/PNR 10-B 1445	M2005110000307071	Marketing Manager	SARL	NC	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 08:15:05.728	2025-12-09 09:12:49.393
6db2fbac-4689-4a13-a38f-c25520a26a26	CFAO Congo	Ollessongo	f	Valériane	vollessongo@cfao.com	+242 05 313 29 98	www.cfaogroup.com	13 rue Côte Matève, BP : 1110, Pointe-Noire, Congo	atlas_congo/client/valériane_ollessongo	0.00	0.00	automobile	NC	NC	Responsable Marketing et Communication	SA	NC	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:01:59.605	2025-12-09 09:13:04.878
e0159fa0-327e-4190-811a-cb6407baff9a	AMC Assurance	Nzongo Dianza	f	Popaul	p.nzongo@amc-assurances.com	+242 06 735 73 12		Blvd. Denis Sassou N’Guesso, 3éme étage immeuble Mucodec, Centre-ville, Brazzaville	atlas_congo/client/popaul_nzongo_dianza	0.00	0.00	banque_assurance	NC	NC	Responsable Système d’Informations, Communication & Qualité	SA	5 000 000 000	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 08:28:31.329	2025-12-09 09:13:29.555
62e94ff2-69ad-4c19-b6a9-f7b83de08528	Ponticelli Congo	Tartavel	f	Romain	romain.tartavel@ponticelli.com	+242 06 704 92 40		ZI La Foire, BP 5355, Pointe-Noire, Congo	atlas_congo/client/romain_tartavel	0.00	0.00	construction	CG-PNR-01-2017-B13-00284	M2017110000654142	Responsable des Opérations	SARL	0	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:18:12.289	2025-12-09 09:18:12.289
3a65bb2f-fe76-4178-b748-661b1d348742	Bralico	Baloki Minkioko	f	Ouria Teliane	ouria.baloki@castel-afrique.com	+242067048230	www.bralico-congo.com	Songolo Z.I., Pointe-Noire, Congo	atlas_congo/client/ouria_teliane_baloki_minkioko	0.00	0.00	agroalimentaire	NC	M2012110000743082	Superviseur Digital	SA	10 515 330 000	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 07:55:42.797	2025-12-09 09:23:52.98
cbee19aa-a170-46c8-922a-75544734f17d	AG Partners Congo	Bouelassa-Nsonde	f	Arielle	arielle.bouelassa-nsonde@ag-partners.com	+242 05 728 22 43	www.ag-partners.com	Cité du Camp Clairon, Résidence Stella, Brazzaville, Congo	atlas_congo/client/arielle_bouelassa-nsonde	0.00	0.00	publicite_marketing	09-B-1664	M2005110000281144	Responsable Média	SARL	1 000 000	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:29:42.347	2025-12-09 09:29:42.347
696886ac-9022-4c94-9a40-0c6947f0ee72	BGFIBank Congo	Mavoungou	f	Michelle	m.mavoungou@bgfi.com	+242 05 671 71 75	www.groupebgfibank.com	Blv. Denis Sassou NGuesso, BP : 14579, Brazzaville, Congo	atlas_congo/client/michelle_mavoungou	0.00	0.00	banque_assurance	CG-BZV-01-2003-B14-00035	M210000001704837	Gestionnaire des Achats	SA	30 000 000 000	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:23:11.971	2025-12-09 09:30:13.333
cc39ced1-e9d1-462d-9e62-112e8643bee2	HMR	Amine	f	Reda	redaamine@hmr-congo.com	+242 06 424 95 62		Cote Mondaine, Pointe-Noire, Congo	atlas_congo/client/reda_amine	0.00	0.00	logistique_transport	NC	NC	Associé Gérant	SARL	NC	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:33:11.065	2025-12-09 09:33:11.065
5c73952f-e7be-4d53-afc4-b32262ca8283	La Distillerie du Congo	Ndembe	f	Stevie	sndembe@groupe-somdia.com	+242 06 472 08 18	www.groupe-somdia.com	BP : 71, N'Kayi, Congo	atlas_congo/client/stevie_ndembe	0.00	0.00	agroalimentaire	CG-MGO-2023-B-02	NC	Assistante Marketing	SAS	10 000 000	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 09:38:32.784	2025-12-09 09:38:32.784
11e15a43-b338-421e-9f1b-470e65be61ef	Congo Telecom	Mokoumbou	f	Prisca	prisca.mokoumbou@congotelecom.cg	+242 05 522 32 48	www.congotelecom.cg	67, Blv. Denis Sassou Nguesso, Centre-ville, Brazzaville	atlas_congo/client/prisca_mokoumbou	0.00	0.00	technologies_information	CG-BZV-01-2003-B15-00014	M23000000170983Q	Manager Brand & Co	SA	33 990 100 000	0%	paiement_90_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:14:52.196	2025-12-09 13:14:52.196
6e9c8ff3-889f-482d-8e84-7a3f87c82d86	MTN Congo	Wagha	f	Philippe	philippe.waga@mtncongo.net	+242 06 466 12 09	www.mtncongo.net	36, Av. Amilcar Cabral, Brazzaville, Congo	atlas_congo/client/philippe_wagha	0.00	0.00	technologies_information	CG-BZV-RCCM-07-B-283	M2005110000457122	Directeur Marketing	SA	11 000 000 000	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:19:23.904	2025-12-09 13:20:15.96
10d988d3-c119-4b28-96ce-1f182b32fa46	SAS Congo	Lahmi	f	Laurent	lahmi.laurent@sascongo.com	+242 05 321 08 98	www.sascongo.com	Av. du Dr. Moe Poaty, Pointe-Noire, Congo	atlas_congo/client/laurent_lahmi	0.00	0.00	services_juridiques	NC	NC	Directeur Commercial	SARL	NC	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:28:17.189	2025-12-09 13:28:17.189
140e6b9f-dc4e-4eb3-bc5e-aa32560dd814	Canal+ Congo	Miassonama	f	Vanluck	vanluck.miassonama@canal-plus.com	+242 06 702 18 78		Tours Jumelles, Av. Amilcar Cabral, Brazzaville, Congo	atlas_congo/client/vanluck_miassonama	0.00	0.00	divertissement_medias	NC	M2014110000233087	Assistant Technique	SARL	NC	0%	paiement_30_jours		{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:33:21.167	2025-12-09 13:33:21.167
95f52e14-40ad-456c-b630-4b6f3bbf4691	Dietsmann Technologies Congo	Loubayi	f	Brice	brice_loubayi@dietsmann.com	+242 06 987 32 84	www.dietsmann.com	Av. de Loango, BP : 1775, Pointe-Noire, Congo	atlas_congo/client/brice_loubayi	0.00	0.00	petrole_gaz	NC	NC	Procurement Manager	NC	NC	0%	paiement_30_jours		{""}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:41:58.589	2025-12-09 13:42:16.422
f75a12c5-0531-4815-ac85-9844f13515cf	SOBRAGA	Rekoula 	f	Cédric	cedric.rekoula@castel-afrique.com	077401040		BP 487 ZI Owendo Gabon  	atlas_gabon/client/cédric_rekoula	0.00	0.00	alimentaire	RG LBV 2003B02819 	790037 F	Directeur Commercial et Marketing	Société Anonyme 	000	0%	paiement_120_jours		{}	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-16 15:59:24.343	2025-12-16 15:59:24.343
\.


--
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.company (id, "companyName", country, city, "codePostal", "registeredAddress", "phoneNumber", email, website, "businessRegistrationNumber", "taxIdentificationNumber", niu, "legalForms", "capitalAmount", currency, "bankAccountDetails", "businessActivityType", "fiscalYearStart", "fiscalYearEnd", "vatRates", "createdAt", "updatedAt") FROM stdin;
6bed2352-3d37-45d8-8e48-595a1533b08f	ATLAS Gabon	Gabon	Libreville	3802	rue de Batavea	+24160070909	info@atlasgabon.com	www.atlasmediaafrica.com	GA-LBV-01-2022-B12-00318	2022 0100 7066-G	NC	SARL	10000000	XAF	40024 00002 36188035958	Publicité et Marketing	2025-12-31 23:00:00	2026-12-30 23:00:00	[{"id": "176520524679680uacz", "taxName": "TVA", "taxValue": "18%"}, {"id": "1765205255582iwbgo8", "taxName": "CSS", "taxValue": "1%"}]	2025-12-08 14:48:33.163	2025-12-08 14:50:35.438
ffce5ace-7101-4296-be7e-35028d6bbcf9	ATLAS Congo	Republic of the Congo	Pointe-Noire	746	ex-Bata	+242056059292	info@atlascongo.com	www.atlasmediaafrica.com	CG / PNR / 14 B 356	NC	M2014110001207071	SARL	5000000	XAF	03200 42006771011 16	Publicité et Marketing	2025-12-31 23:00:00	2026-12-30 23:00:00	[{"id": "1765206031200kehiuh", "taxName": "TVA", "taxValue": "18%"}, {"id": "1765206059450ce75ib", "cumul": [{"id": 0, "name": "TVA", "check": true}], "taxName": "CA", "taxValue": "5%"}]	2025-12-08 15:02:01.64	2025-12-08 15:02:01.64
0da6b7ad-d5cd-4bec-9563-cdcceb064332	TLDC Congo	Republic of the Congo	Pointe-Noire	99999	Blv. du Général De Gaule	+242 05 092 00 00	info@my-konnect.com		1111	1111	1111	SARL	10000000	XAF	12	Internet	2025-12-31 23:00:00	2025-12-31 23:00:00	[{"id": "1767102557201vhlgsa", "taxName": "TVA", "taxValue": "18%"}, {"id": "1767102565718qz8xqr", "cumul": [{"id": 0, "name": "TVA", "check": true}], "taxName": "CA", "taxValue": "5%"}]	2025-12-30 13:49:45.171	2025-12-30 13:49:45.171
\.


--
-- Data for Name: company_documents; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.company_documents (id, logo, "position", size, "primaryColor", "secondaryColor", "quotesPrefix", "invoicesPrefix", "deliveryNotesPrefix", "purchaseOrderPrefix", "quotesInfo", "invoicesInfo", "deliveryNotesInfo", "purchaseOrderInfo", "companyId", "recordFiles") FROM stdin;
7b52176b-cb13-452a-87c2-a953ea9704de	\N	Center	Medium	#fbbf24	#fef3c7	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N
f5814f7d-623d-47f3-a9a3-5bb3d39a3b53	atlas_gabon/logo/logo----e90cc90d-65b2-4fad-ac0a-2cceaefc38b7.png	Center	Small	#fbbf24	#fefaeb	AG-D	AG-F	AG-BL	AG-BC					6bed2352-3d37-45d8-8e48-595a1533b08f	\N
75c430d3-36c6-4391-a3b1-0ec89f1124ae	\N	Center	Medium	#fbbf24	#fef3c7	\N	\N	\N	\N	\N	\N	\N	\N	0da6b7ad-d5cd-4bec-9563-cdcceb064332	\N
\.


--
-- Data for Name: contract; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.contract (id, "contractNumber", type, "hasDelete", "clientId", "lessorId", "lessorType", "companyId", "billboardId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deletion; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.deletion (id, type, "recordId", "isValidate", "userId", "companyId", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: delivery_note; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.delivery_note (id, "deliveryNoteNumber", "hasDelete", note, files, "pathFiles", "amountType", "totalHT", discount, "discountType", "paymentLimit", "totalTTC", "isCompleted", "fromRecordReference", "fromRecordId", "fromRecordName", "createdById", "clientId", "projectId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dibursement; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.dibursement (id, type, "hasDelete", reference, date, movement, "categoryId", "natureId", amount, "amountType", "periodStart", "periodEnd", "paymentType", "checkNumber", "referenceInvoiceId", "referencePurchaseOrderId", "allocationId", "sourceId", "payOnBehalfOfId", description, comment, "companyId", "clientId", "projectId", "fiscalObjectId", "paymentId", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: dibursement_data; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.dibursement_data (id, date, category, nature, amount, "amountType", "periodStart", "periodEnd", "paymentType", "checkNumber", "purchaseOrder", allocation, source, "payOnBehalfOf", description, comment, client, supplier, project, "fiscalObject", "isPaid") FROM stdin;
e41ec408-d12a-4dab-a673-10803242cb0f	2025-12-17 07:54:37.278	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	7b43da29-f446-4477-b47f-1de8327ffeb1	4567.00	HT	2025-12-18 23:00:00	2026-01-01 23:00:00	cash	\N	\N	\N	01KC1XA9V3XBD08WKTY9FN7D8W	\N	\N	\N	\N	\N	\N	\N	f
6d372a55-e23e-46f1-b936-351fd965f83c	2025-12-30 13:35:28.624	01KDCVY2G6R04AY82C5579C5TV	6a9b8858-9a3b-461a-84a8-a429fa9f499b	200000.00	HT	\N	\N	cash	\N	\N	01KDQQ9ZJ7F66PZ9JJ9R1PG0BD	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement commission Sandy 2025	\N	\N	\N	\N	\N	f
66e1f5ae-6df9-47ff-a89b-509e45dc32fe	2025-12-30 13:36:50.725	01KBZ7QQ5GJANBZ1PE9MBC3MNX	b42eba6b-0628-45fc-bc8d-10d39dd6ea8e	1000000.00	HT	2025-12-31 23:00:00	2026-03-30 23:00:00	check	345678	\N	\N	01KC1XCGXWYEKTNTWV7T8G5322	\N	\N	\N	\N	\N	\N	\N	f
a513cfc3-8678-4883-aab8-7b3eba5385d1	2026-01-05 00:00:00	01KEBW9XAFB78DWJSXP6R78ECT	85e2b561-1689-43b3-a986-88e28fc0c87d	4500.00	HT	\N	\N	cash	\N	\N	\N	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement vidange Kavaki	VIDANGE KAVAKI	\N	\N	\N	\N	f
f63946ab-4790-4b4d-882c-f8a7dc076671	2026-01-05 00:00:00	01KEBX2HX5J74ZBX2S3XB8C96D	3209553d-f94e-4781-90c4-c5b7c22b9bcd	8000.00	HT	\N	\N	cash	\N	\N	\N	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement 2 bombones eau bureau du haut	Achat 2 bombones eau	\N	\N	\N	\N	f
fffe4036-5931-42a4-8e8c-bc2e73e50e49	2026-01-05 00:00:00	01KBZ7QQ5G762PW22CHGR71QSP	b269c2d4-c260-46ea-98ab-cb31675c4178	80000.00	HT	\N	\N	cash	\N	\N	01KEBXJ7HZQS5VXQQZPRC91D65	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement Branding vehicule ASKA	Prestation Melid branding d'un vehicule du client ASKA	\N	\N	\N	\N	f
fc0b3cc8-abc9-45f5-a62b-44730f32cab8	2026-01-05 00:00:00	01KBZ7QQ5GJANBZ1PE9MBC3MNX	2df2d48a-8230-4426-b4c2-a487c1e324e6	60000.00	HT	2026-01-01 00:00:00	2026-01-31 00:00:00	cash	\N	\N	01KEBXPHR0XZARQX5PQ4PYNENG	01KC1XA9V3XBD08WKTY9FN7D8W	\N	paiement dépôt brazzaville 	mois de janvier 	\N	\N	\N	\N	f
93c9b4ac-a8e9-4898-a90a-e111bdb872fc	2026-01-05 00:00:00	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ebb296a1-ee3f-40b3-8f09-7b3bb754e410	25000.00	HT	2026-01-01 00:00:00	2026-01-31 00:00:00	cash	\N	\N	01KEBY7SH10RFCJ3H80XQQVAPJ	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement location façade Bacongo	reglement Location bacongo mois de janvier	\N	\N	\N	\N	f
de51965a-e0e2-4376-b7c2-ce16966fb0eb	2026-01-05 00:00:00	01KBZ7QQ5G762PW22CHGR71QSP	1445deef-cf90-47e5-97e9-4c7fc2a92ae1	374535.00	TTC	\N	\N	cash	\N	\N	01KEBYDTK89WJ1XK1RGAEJMG4E	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement honoraire comptable	Règlement  honoraire mois de Décembre 2025	\N	\N	\N	\N	f
a091706d-ea4b-44a6-802e-9185b99d9b9c	2026-01-06 00:00:00	01KBZ7QQ5G762PW22CHGR71QSP	4a5e9e70-8eb0-4a66-b750-a2118dfe0240	30000.00	HT	\N	\N	cash	\N	\N	01KEBZ5JKEBHHXJXJP4H3D1A0S	01KC1XA9V3XBD08WKTY9FN7D8W	\N	paiement pose drapeaux congo telecom	reglement saint eudes pose drapeaux congo telecom	\N	\N	\N	\N	f
bda2ccdf-3ac3-4460-8c10-aad496e609a4	2026-01-06 00:00:00	01KBZ7QQ5G762PW22CHGR71QSP	4a5e9e70-8eb0-4a66-b750-a2118dfe0240	15000.00	HT	\N	\N	cash	\N	\N	01KEBZAAA4G1W5HPD32EW5VHXD	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement location echafaudage pose drapeaux congo telecom	reglement pose echafaudage 	\N	\N	\N	\N	f
ce16c357-e074-401e-bb17-d029040c4324	2026-01-06 00:00:00	01KBZ7QQ5G762PW22CHGR71QSP	b729b572-4e11-4424-ad67-16619c22a4b4	5000.00	HT	\N	\N	cash	\N	\N	01KEBZFKDH1SY1S0Y9D2FRDT9V	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement colle bache Moulembo	achat colle bache moulembo	\N	\N	\N	\N	f
0cf9067c-2260-4a4b-906f-5222a91e4cc0	2026-01-06 00:00:00	01KEBZKAFVANBXJCFG3N3YQ4VG	cd8af921-f12c-4bcb-bf8a-7fc1e2e5bfcc	30000.00	HT	\N	\N	cash	\N	\N	01KEBZN2NN3HVNHHG2Z4HN6YA4	01KC1XA9V3XBD08WKTY9FN7D8W	\N	paiement transport Christopher du lundi 05 Janvier au 19 Janvier 2026	Transport Christopher	\N	\N	\N	\N	f
456eb59d-54dd-4e72-aef4-93108d74ca2b	2026-01-07 10:25:43.251	01KBZ7QQ5G762PW22CHGR71QSP	863a1872-0ffb-4627-9e06-4db508d54e08	45000.00	HT	\N	\N	cash	\N	\N	01KEBZXKY2R9SQ0F6R2RZQGG06	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement 3 bidons de gazoil pour les 3 bureaux ATLAS CONGO	Reglement 3 bidons gazoil bureaux ATLAS	\N	\N	\N	\N	f
ea48c81e-8ce8-4148-b40f-35194a1a8271	2026-01-07 10:28:50.23	01KBZ7QQ5G762PW22CHGR71QSP	863a1872-0ffb-4627-9e06-4db508d54e08	30000.00	HT	\N	\N	cash	\N	\N	01KEBZXKY2R9SQ0F6R2RZQGG06	01KC1XA9V3XBD08WKTY9FN7D8W	\N	Paiement 2 bidons de gazoil bureau TLDC et CONSULAT	reglement 1 bidon gazoil  bureauTLDC et 1 bidon gazoil bureau Consulat	\N	\N	\N	\N	f
\.


--
-- Data for Name: display_board; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.display_board (id, name, "companyId") FROM stdin;
d22af762-88c0-488d-ab53-a0e6d5d2ece6	Vinyle plein	ffce5ace-7101-4296-be7e-35028d6bbcf9
8f69c2d8-c6b1-4124-9caa-6aa277d24487	Echelles métalliques 	6bed2352-3d37-45d8-8e48-595a1533b08f
8664a482-1d06-43b8-b96b-230454c80c80	Profilté aluminium	6bed2352-3d37-45d8-8e48-595a1533b08f
\.


--
-- Data for Name: fiscal_object; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.fiscal_object (id, name, "companyId", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.invoice (id, "invoiceNumber", "hasDelete", note, files, "pathFiles", "totalHT", discount, "discountType", "paymentLimit", "totalTTC", payee, "isPaid", "amountType", "createdById", "clientId", "fromRecordReference", "fromRecordId", "fromRecordName", "projectId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.item (id, reference, state, "hasTax", name, description, quantity, price, "updatedPrice", discount, "discountType", currency, "itemType", "locationStart", "locationEnd", "itemInvoiceType", "invoiceId", "quoteId", "billboardId", "productServiceId", "purchaseOrderId", "deliveryNoteId", "companyId", "createdAt", "updatedAt") FROM stdin;
8899119b-90d0-45bc-95f4-89466dd71fff	IMP-T-001-FCV	PURCHASE	t	IMP-FRS-T-001-FCV	\N	419	7500.00	3142500.00	0	purcent	XAF	service	2025-12-26 12:15:10.992	2025-12-27 00:00:00	INVOICES	\N	\N	\N	fd822706-31e8-424d-91ba-345878b60595	ef647642-3d55-4c05-a292-2a7db3e1562b	\N	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-26 12:15:10.994	2025-12-26 12:15:10.994
\.


--
-- Data for Name: lessor_type; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.lessor_type (id, type, name, "companyId") FROM stdin;
176f71a2-b014-46f5-a3ff-13ce1e5fd982	PUBLIC	Mairie	6bed2352-3d37-45d8-8e48-595a1533b08f
99b36f07-c27c-49e6-a402-2e044b342078	PUBLIC	Personne morale	6bed2352-3d37-45d8-8e48-595a1533b08f
355b991f-6350-4da6-b445-be95766471b8	PUBLIC	Personne physique	6bed2352-3d37-45d8-8e48-595a1533b08f
be535637-eaaf-4585-9887-9199d31ea4d9	PUBLIC	Mairie	ffce5ace-7101-4296-be7e-35028d6bbcf9
68a60c7e-4f07-404f-b2dc-aeb1b6751967	PUBLIC	Personne morale	ffce5ace-7101-4296-be7e-35028d6bbcf9
8b72f8c3-2e56-4591-862b-75a2f37a7b86	PUBLIC	Personne physique	ffce5ace-7101-4296-be7e-35028d6bbcf9
c315bec5-2855-47a7-ac3e-6c8b37b48312	PRIVATE	Privé	6bed2352-3d37-45d8-8e48-595a1533b08f
c3a1bc07-1cf3-4a88-87c4-8ab96c762bda	PRIVATE	Public 	6bed2352-3d37-45d8-8e48-595a1533b08f
6c10234f-3fca-4bb5-a55a-0c451732e308	PUBLIC	Mairie	0da6b7ad-d5cd-4bec-9563-cdcceb064332
e5dcc0d0-1024-4901-b973-31b8eae140ab	PUBLIC	Personne morale	0da6b7ad-d5cd-4bec-9563-cdcceb064332
30c0a195-fd5a-4b0c-9fa0-4f86b95a0bbf	PUBLIC	Personne physique	0da6b7ad-d5cd-4bec-9563-cdcceb064332
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.notification (id, type, active, "for", "receiptId", "dibursementId", "invoiceId", "quoteId", "deliveryNoteId", "purchaseOrderId", "appointmentId", "projectId", "taskId", "userId", "companyId", "updatedAt", "createdAt", message, "paymentDibursementId") FROM stdin;
cee21fe9-88e5-4047-ba7f-04efb5d08e94	CONFIRM	f	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-17 07:53:49.125	2025-12-17 07:53:28.837	Paul Jean a lancé un décaissement de 100 000 XAF en attente de validation depuis le compte Caisse.	\N
d4dbda80-c9d6-4e2b-a623-eaa2f0c9532b	ALERT	t	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-17 07:53:49.136	2025-12-17 07:53:49.136	Ralph Pinto a annulé un décaissement de 100 000 XAF dans le compte Caisse.	\N
2d7d9360-8403-4d37-9b2c-87b0517d2da9	CONFIRM	f	DISBURSEMENT	\N	e41ec408-d12a-4dab-a673-10803242cb0f	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-17 07:55:08.837	2025-12-17 07:54:54.04	Paul Jean a lancé un décaissement de 4 567 XAF en attente de validation depuis le compte Caisse.	\N
2a42654d-549b-4ced-8a27-6afa322d4d5d	CONFIRM	f	DISBURSEMENT	\N	66e1f5ae-6df9-47ff-a89b-509e45dc32fe	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:05:17.251	2025-12-30 13:37:42.41	Dan Tchitembo a initié un décaissement de 1 000 000 XAF, au titre de la catégorie « Règlement loyer » (motif : Bureau Direction), depuis le compte « BGFIBank », actuellement en attente de validation.	\N
d1e72bc7-4f4c-480d-bee2-29cc8e203be2	CONFIRM	f	DISBURSEMENT	\N	6d372a55-e23e-46f1-b936-351fd965f83c	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:05:44.581	2025-12-30 13:36:24.294	Dan Tchitembo a initié un décaissement de 200 000 XAF, au titre de la catégorie « Frais de fonctionnement » (motif : Commissions), depuis le compte « Caisse », actuellement en attente de validation.	\N
9def6b4c-71e0-4763-b628-ca6db32e8014	CONFIRM	f	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:05:54.707	2025-12-17 09:51:16.358	Paul Jean a lancé un décaissement de 5 678 XAF en attente de validation depuis le compte Caisse.	\N
a6ddf945-240e-4e2e-9705-42ad3150a1c7	ALERT	t	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:05:54.868	2026-01-06 07:05:54.868	Ralph Pinto a annulé un décaissement de 5 678 XAF dans le compte Caisse.	\N
e671291d-81a3-4b05-9667-37b9e9d3247f	CONFIRM	f	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:12:13.656	2026-01-06 07:11:42.586	Dan Tchitembo a initié un décaissement de 19 000 XAF, au titre de la catégorie « Règlement salaire » (motif : Ghislain), depuis le compte « Caisse », actuellement en attente de validation.	\N
8fe659da-4496-4133-be90-6126c2b2c211	ALERT	t	DISBURSEMENT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-06 07:12:13.728	2026-01-06 07:12:13.728	Ralph Pinto a annulé un décaissement de 19 000 XAF dans le compte Caisse.	\N
e208295c-83e1-4a21-bbaa-d9d7d5d89c74	CONFIRM	t	DISBURSEMENT	\N	a513cfc3-8678-4883-aab8-7b3eba5385d1	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:35:58.348	2026-01-07 09:35:58.348	Dan Tchitembo a initié un décaissement de 4 500 XAF, au titre de la catégorie « VIDANGE KAVAKI » (motif : Vidange Kavaki), depuis le compte « Caisse », actuellement en attente de validation.	\N
d40a2d29-c3fd-4956-bff6-e21c23e0affa	CONFIRM	t	DISBURSEMENT	\N	f63946ab-4790-4b4d-882c-f8a7dc076671	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:39:23.763	2026-01-07 09:39:23.763	Dan Tchitembo a initié un décaissement de 8 000 XAF, au titre de la catégorie « Bombone EAU » (motif : Bombone Eau), depuis le compte « Caisse », actuellement en attente de validation.	\N
45ae0cc5-cc5d-45dc-8acc-4f40188a6ccb	CONFIRM	t	DISBURSEMENT	\N	fffe4036-5931-42a4-8e8c-bc2e73e50e49	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:46:06.168	2026-01-07 09:46:06.168	Dan Tchitembo a initié un décaissement de 80 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : MELID), depuis le compte « Caisse », actuellement en attente de validation.	\N
8b229e7c-af8e-4871-b164-55c59b56c81a	CONFIRM	t	DISBURSEMENT	\N	fc0b3cc8-abc9-45f5-a62b-44730f32cab8	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:53:04.601	2026-01-07 09:53:04.601	Dan Tchitembo a initié un décaissement de 60 000 XAF, au titre de la catégorie « Règlement loyer » (motif : Dépôt BZV), depuis le compte « Caisse », actuellement en attente de validation.	\N
1da81a35-154a-4229-af34-bcbce32824c4	CONFIRM	t	DISBURSEMENT	\N	93c9b4ac-a8e9-4898-a90a-e111bdb872fc	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:59:21.349	2026-01-07 09:59:21.349	Dan Tchitembo a initié un décaissement de 25 000 XAF, au titre de la catégorie « Règlement loyer » (motif : Loyer Bacongo), depuis le compte « Caisse », actuellement en attente de validation.	\N
d6188050-6469-4c13-80fb-b8482a9de717	CONFIRM	t	DISBURSEMENT	\N	de51965a-e0e2-4376-b7c2-ce16966fb0eb	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:10:30.447	2026-01-07 10:10:30.447	Dan Tchitembo a initié un décaissement de 374 535 XAF, au titre de la catégorie « Règlement fournisseur » (motif : Cabinet Synergy), depuis le compte « Caisse », actuellement en attente de validation.	\N
1d500904-35ae-46df-b760-862e4ed405b3	CONFIRM	t	DISBURSEMENT	\N	a091706d-ea4b-44a6-802e-9185b99d9b9c	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:14:55.175	2026-01-07 10:14:55.175	Dan Tchitembo a initié un décaissement de 30 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : Saint-Eudes), depuis le compte « Caisse », actuellement en attente de validation.	\N
f7b692ea-e0fa-4e8e-8836-89f360ec3369	CONFIRM	t	DISBURSEMENT	\N	bda2ccdf-3ac3-4460-8c10-aad496e609a4	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:17:14.802	2026-01-07 10:17:14.802	Dan Tchitembo a initié un décaissement de 15 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : Saint-Eudes), depuis le compte « Caisse », actuellement en attente de validation.	\N
d7805c39-d003-49d0-9401-f98c4b148a30	CONFIRM	t	DISBURSEMENT	\N	ce16c357-e074-401e-bb17-d029040c4324	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:20:04.369	2026-01-07 10:20:04.369	Dan Tchitembo a initié un décaissement de 5 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : fournisseurs divers), depuis le compte « Caisse », actuellement en attente de validation.	\N
282fcf2c-744d-4611-880b-e812df5018f6	CONFIRM	t	DISBURSEMENT	\N	0cf9067c-2260-4a4b-906f-5222a91e4cc0	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:25:29.794	2026-01-07 10:25:29.794	Dan Tchitembo a initié un décaissement de 30 000 XAF, au titre de la catégorie « TRANSPORT » (motif : CHRISTOPHER), depuis le compte « Caisse », actuellement en attente de validation.	\N
c532bd73-ce16-4ca8-960e-f9eedb819e7f	CONFIRM	t	DISBURSEMENT	\N	456eb59d-54dd-4e72-aef4-93108d74ca2b	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:28:43.591	2026-01-07 10:28:43.591	Dan Tchitembo a initié un décaissement de 45 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : ORIGINAL+), depuis le compte « Caisse », actuellement en attente de validation.	\N
b718bf93-8f2e-4637-a254-c4f0a152c4a6	CONFIRM	t	DISBURSEMENT	\N	ea48c81e-8ce8-4148-b40f-35194a1a8271	\N	\N	\N	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:31:21.258	2026-01-07 10:31:21.258	Dan Tchitembo a initié un décaissement de 30 000 XAF, au titre de la catégorie « Règlement fournisseur » (motif : ORIGINAL+), depuis le compte « Caisse », actuellement en attente de validation.	\N
\.


--
-- Data for Name: notification_read; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.notification_read (id, "notificationId", "userId", "readAt") FROM stdin;
57a24db8-1340-44a3-86a2-23a1dd0b33e8	cee21fe9-88e5-4047-ba7f-04efb5d08e94	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2025-12-17 07:53:49.129
44bd0c2c-119b-49f2-bc00-dc7607877095	2d7d9360-8403-4d37-9b2c-87b0517d2da9	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2025-12-17 07:55:08.837
dd5be9b9-68b4-4f36-b9c6-9f1998f46f6f	2a42654d-549b-4ced-8a27-6afa322d4d5d	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2026-01-06 07:05:17.251
147e5eb5-42d6-49fe-8ff8-59013bf15bc2	d1e72bc7-4f4c-480d-bee2-29cc8e203be2	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2026-01-06 07:05:44.581
b95d57ab-f6b0-41ed-8f30-9cb539ff0192	9def6b4c-71e0-4763-b628-ca6db32e8014	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2026-01-06 07:05:54.771
9ca510fd-8143-4e0b-b5d7-71d75a748e77	e671291d-81a3-4b05-9667-37b9e9d3247f	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2026-01-06 07:12:13.692
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.payment (id, amount, "paymentMode", infos, "invoiceId", "purchaseOrderId", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.permission (id, "profileId", resource, actions, "createdAt", "updatedAt") FROM stdin;
3959fdf4-a3f9-4ae1-bb74-56fcfb98314d	e9ef8572-e300-4864-bced-b44c73dc28c5	DASHBOARD	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
38d95a64-07f5-4425-800e-f09cf3aae8db	e9ef8572-e300-4864-bced-b44c73dc28c5	CLIENTS	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
c98d8ca6-3f53-4b81-b6d7-39f93f0e5406	e9ef8572-e300-4864-bced-b44c73dc28c5	SUPPLIERS	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
ed0cba3d-0f50-4665-ba54-c5daf561f356	e9ef8572-e300-4864-bced-b44c73dc28c5	INVOICES	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
7d3fb029-af10-40b6-be5c-3a130ffc08c3	e9ef8572-e300-4864-bced-b44c73dc28c5	QUOTES	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
e6605389-21d6-4752-9f8b-3fed30cc8292	e9ef8572-e300-4864-bced-b44c73dc28c5	DELIVERY_NOTES	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
e55b704b-8d14-40ab-890b-413d075ed6a1	e9ef8572-e300-4864-bced-b44c73dc28c5	PURCHASE_ORDER	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
f5e482e6-9b98-4ebc-b90a-fc318c115206	e9ef8572-e300-4864-bced-b44c73dc28c5	CREDIT_NOTES	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
93901c80-983d-4d7f-9a07-b2d677d67444	e9ef8572-e300-4864-bced-b44c73dc28c5	PRODUCT_SERVICES	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
0cbc2d2b-17a9-43db-a8c4-5bd845e10ed2	e9ef8572-e300-4864-bced-b44c73dc28c5	BILLBOARDS	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
2195a79f-a238-4e68-acd5-f92e455435fb	e9ef8572-e300-4864-bced-b44c73dc28c5	PROJECTS	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
3e25787c-ca09-4185-bf07-22c2c3e5b68a	e9ef8572-e300-4864-bced-b44c73dc28c5	APPOINTMENT	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
3627f3de-8af6-4735-b27e-56b65ef65947	e9ef8572-e300-4864-bced-b44c73dc28c5	CONTRACT	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
3e53713b-8966-480f-871a-8612eaf1b2f3	e9ef8572-e300-4864-bced-b44c73dc28c5	TRANSACTION	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
14ac9ec9-66c3-4c9f-8a74-2cf318f0b748	e9ef8572-e300-4864-bced-b44c73dc28c5	SETTING	{READ,MODIFY,CREATE}	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
362d5ddc-cadc-488f-9aec-50dc8ca91676	f6413675-5272-4423-91d7-2aaf9553db6d	DASHBOARD	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
a4fc14a3-7236-47bd-9e71-1f38d560139a	f6413675-5272-4423-91d7-2aaf9553db6d	CLIENTS	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
2de44109-84be-4cf4-b834-359cae1ecf0a	f6413675-5272-4423-91d7-2aaf9553db6d	SUPPLIERS	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
00d79160-6b4a-40fc-b396-f600729afe3e	f6413675-5272-4423-91d7-2aaf9553db6d	INVOICES	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
bc556622-d386-488f-a1cb-16b2f842c356	f6413675-5272-4423-91d7-2aaf9553db6d	QUOTES	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
fc431b8f-635a-4ef8-a3ee-ff2d0d75e806	f6413675-5272-4423-91d7-2aaf9553db6d	DELIVERY_NOTES	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
aa2ca58f-1aac-450a-860b-3bf20d8fa295	f6413675-5272-4423-91d7-2aaf9553db6d	PURCHASE_ORDER	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
db31e268-ce0f-425f-9fc6-e3dfd77286b1	f6413675-5272-4423-91d7-2aaf9553db6d	PRODUCT_SERVICES	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
ebd40007-b816-4446-acb5-68f407b7e51a	f6413675-5272-4423-91d7-2aaf9553db6d	BILLBOARDS	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
94d50505-ba6d-4863-b8be-787ceacf3845	f6413675-5272-4423-91d7-2aaf9553db6d	PROJECTS	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
3ec1e36a-1012-42a1-8343-250b7a3cfada	f6413675-5272-4423-91d7-2aaf9553db6d	APPOINTMENT	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
039f7a91-7512-45fc-91ac-107e75141ce0	f6413675-5272-4423-91d7-2aaf9553db6d	CONTRACT	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
8eca1291-14c1-46ca-b47f-b04144147359	f6413675-5272-4423-91d7-2aaf9553db6d	TRANSACTION	{READ,MODIFY,CREATE}	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
b6b17b14-a9c5-4ecf-8070-adc6e5926468	e5067488-ea10-4458-b0e5-4cdbcedb81af	TRANSACTION	{READ,MODIFY,CREATE}	2025-12-17 07:52:26.016	2025-12-17 07:52:26.016
549d6b36-140a-49f7-85ab-50d4027012d7	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	CLIENTS	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
42c5847a-526d-4419-9c52-cb897637ca07	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	SUPPLIERS	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
62702a47-4e4a-4791-9e9e-fa9baa3ad78e	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	INVOICES	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
20a44ae1-f958-4b52-90f6-d8803301a6ff	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	PURCHASE_ORDER	{READ,MODIFY,CREATE}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
78a926dc-c988-496c-a229-e9956c41d74c	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	PRODUCT_SERVICES	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
044ac4c3-3559-4d46-9ef4-503141cfcfc7	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	PROJECTS	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
15d4e5e1-525b-468c-a697-b58b42d4dc88	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	APPOINTMENT	{READ,MODIFY,CREATE}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
82f371dd-835a-4a20-a33b-425cbf98a973	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	CONTRACT	{READ}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
884d9dad-2f89-45aa-ad1f-9a9733722f00	ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	TRANSACTION	{READ,MODIFY,CREATE}	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
9b401f12-5764-4b0a-b662-476115b2e302	0886c61d-e56f-44e3-bbcb-b5335830716b	CLIENTS	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
7d8d4ef5-017b-487d-b927-0fe45b1c21c9	0886c61d-e56f-44e3-bbcb-b5335830716b	SUPPLIERS	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
f26cdb4c-3dee-4e38-8161-5ce912318649	0886c61d-e56f-44e3-bbcb-b5335830716b	INVOICES	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
d7214193-bbac-4dc7-a3a4-2c79f8fd1f25	0886c61d-e56f-44e3-bbcb-b5335830716b	PURCHASE_ORDER	{READ,MODIFY,CREATE}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
8aafe485-6953-4ffc-94f5-6d7f117364c6	0886c61d-e56f-44e3-bbcb-b5335830716b	PRODUCT_SERVICES	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
9fd2921e-dd19-470a-9fd5-505c441d12ae	0886c61d-e56f-44e3-bbcb-b5335830716b	PROJECTS	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
7ddaa195-17ad-4acb-9224-a8ed52c000ac	0886c61d-e56f-44e3-bbcb-b5335830716b	APPOINTMENT	{READ,MODIFY,CREATE}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
6fc127b1-2bb5-4d22-88f2-f6b600cb94e0	0886c61d-e56f-44e3-bbcb-b5335830716b	CONTRACT	{READ}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
bafbbfc7-eb82-4e1b-972f-4b24ed924ec0	0886c61d-e56f-44e3-bbcb-b5335830716b	TRANSACTION	{READ,MODIFY,CREATE}	2025-12-30 13:51:30.628	2025-12-30 13:51:30.628
\.


--
-- Data for Name: product_service; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.product_service (id, type, "hasTax", "hasDelete", reference, category, designation, description, "unitPrice", cost, "unitType", quantity, "companyId", "createdAt", "updatedAt") FROM stdin;
b466fd50-9c40-4390-870d-554a90fce2b7	PRODUCT	t	f	BRO-TSB	Branding	T-Shirt Blanc	Taille : M\nCouleur : Blanc\nCol : Rond\nMatière : Cotton 100%\n	2500.00	1200.00	Unit	1	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:54:58.37	2025-12-09 13:54:58.37
21b5e82e-c451-4d8e-83eb-594bffafc2d0	SERVICE	t	f	BRO-BR-2Z	Branding	Broderie 2 zones	Materiel : T-shirt\nZone de marquage 1 : coeur\nTaille : 9cm\nZone de marquage 2 : dos\nTaille : 9cm	1500.00	600.00	Unit	100000000	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:57:02.22	2025-12-09 13:57:47.91
979a7ba5-d0e3-4d38-81e5-3e9b5f14546b	SERVICE	t	f	BRO-BR-1Z	Branding	Broderie 1 zone	Materiel : T-shirt\nZone de marquage 1 : coeur\nTaille : 9cm	1000.00	300.00	Unit	100000000	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:56:56.904	2025-12-09 13:57:59.705
cf7e7f99-6036-402f-b513-b40aa7aa27d3	SERVICE	t	f	BRO-BR-3Z	Branding	Broderie 3 zone	Materiel : T-shirt\nZone de marquage 1 : coeur\nTaille : 9cm\nZone de marquage 2 : dos\nTaille : 9cm\nZone de marquage 3 : épaule\nTaille : 9cm	2000.00	900.00	Unit	100000000	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:57:52.702	2025-12-09 13:58:43.137
5544e6ac-1027-453d-9ee4-b2f1b0670157	SERVICE	t	f	BRO-SER-1Z	Branding	Sérigraphie 1 zone	Materiel : T-shirt\nZone de marquage 1 : coeur\nTaille : 9cm	1000.00	500.00	Unit	100000000	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 13:58:54.875	2025-12-09 14:00:00.061
3a811198-674b-4595-9eab-039dcb988610	PRODUCT	t	f	BRO-CB	Branding	Casquette Blanche	Taille : unique\nCouleur : Blanc\nMatière : Cotton 100%\n	1800.00	900.00	Unit	1	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 14:11:51.069	2025-12-09 14:12:30.958
1e85289d-bfbb-4cb9-94e7-23eed8b82f33	PRODUCT	t	f	BRO-TSN	Branding	T-Shirt Noir	Taille : M\nCouleur : Noir\nCol : Rond\nMatière : Cotton 100%\n	2500.00	1200.00	Unit	1	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 14:15:09.203	2025-12-09 14:16:04.748
fd822706-31e8-424d-91ba-345878b60595	SERVICE	t	f	IMP-T-001-FCV	Impression	IMP-FRS-T-001-FCV	Impression posters Full HD\nMatière : bâche pleine 610 Grs\nDimensions (hors fond perdu) : 35,5m x 11,82m\nSurface : 419\nSite : marché Potos\nVille : Franceville\nFaçonnage : fonds perdus 10cm / soudures verticales inversées / œillets métalliques\nchaque 30cm\nCampagne : \nPanneau : Marché Potos	7500.00	7500.00	Unit	1000000	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-26 12:06:09.861	2025-12-26 12:15:10.994
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.profile (id, key, role, firstname, lastname, image, path, phone, job, salary, "internalRegulations", passport, banned, "banReason", "banExpires", "companyId", "userId", "createdAt", "updatedAt") FROM stdin;
e9ef8572-e300-4864-bced-b44c73dc28c5	1	USER	Ralph	Pinto	\N	3e051239-d00b-4377-874c-9d1a997abfcc_ralph_pinto				\N	\N	\N	\N	\N	\N	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	2025-12-08 14:15:37.572	2025-12-08 14:15:37.572
f6413675-5272-4423-91d7-2aaf9553db6d	2	USER	Alexandre	Vesmare	cd8alxx_alexandre_vesmare/c3ae5022-74d3-4ab9-b352-c991594ba10d.jpg	cd8alxx_alexandre_vesmare	+24177539335	Directeur Général	1000000	\N	\N	\N	\N	\N	6bed2352-3d37-45d8-8e48-595a1533b08f	1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	2025-12-08 14:50:19.684	2025-12-08 14:50:19.684
e5067488-ea10-4458-b0e5-4cdbcedb81af	3	USER	Paul	Jean		zr8zj6g_paul_jean	789	kjdsn	789	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	2025-12-17 07:52:26.016	2025-12-17 07:52:26.016
ec88fa9a-4a30-4b66-9f99-98ef0e5dc6c3	5	USER	Dan	Tchitembo		7xdekky_dan_tchitembo	+242 06 664 66 54	Responsable comptablitié	200000	\N	\N	\N	\N	\N	0da6b7ad-d5cd-4bec-9563-cdcceb064332	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	2025-12-30 13:50:45.499	2025-12-30 13:50:45.499
0886c61d-e56f-44e3-bbcb-b5335830716b	4	USER	Dan	Tchitembo		fx46gtj_dan_tchitembo	+242 06 664 66 54	Responsable Comptabilité	200000	\N	\N	\N	\N	\N	ffce5ace-7101-4296-be7e-35028d6bbcf9	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	2025-12-30 13:25:19.26	2025-12-30 13:51:30.628
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.project (id, name, deadline, "hasDelete", "projectInformation", amount, balance, files, path, status, "clientId", "companyId", "createdAt", "updatedAt") FROM stdin;
4b00ba99-93e3-48c2-a066-5bdbd0f2c883	Réimpression Potos	2025-12-27 00:00:00	f		0.00	0.00	{}	atlas_gabon/project/réimpression_potos_----huozr33jbzhhqo7ri4zwjv0louglgiwo	BLOCKED	f75a12c5-0531-4815-ac85-9844f13515cf	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-26 12:07:10.628	2025-12-26 12:16:47.835
\.


--
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.purchase_order (id, "purchaseOrderNumber", note, "hasDelete", files, "pathFiles", "totalHT", discount, "discountType", "paymentLimit", "totalTTC", payee, "isPaid", "amountType", "createdById", "supplierId", "projectId", "companyId", "createdAt", "updatedAt") FROM stdin;
ef647642-3d55-4c05-a292-2a7db3e1562b	1		f	{}	atlas_gabon/purchase-order/ag-bc-1_----cslevqx/files	3142500.00	0	purcent	paiement_120_jours	3739575.00	0.00	f	HT	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	5e4d2f71-44a0-4d78-b84b-d99aaec9a1f4	4b00ba99-93e3-48c2-a066-5bdbd0f2c883	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-26 12:07:34.248	2025-12-26 12:15:10.994
\.


--
-- Data for Name: quote; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.quote (id, "quoteNumber", "hasDelete", note, files, "pathFiles", "amountType", "totalHT", discount, "discountType", "paymentLimit", "totalTTC", "isCompleted", "fromRecordReference", "fromRecordId", "fromRecordName", "createdById", "clientId", "projectId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rateLimit; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."rateLimit" (id, key, count, "lastRequest") FROM stdin;
OioOaLAKHkZNRkEKlLYcuGYHHvi69F6c	160.113.1.248/get-session	1	1765837027064
uJl6kYvn36gBi2ON6dqm5Zg40wTMoc3i	160.113.1.147/get-session	1	1765843942389
8MKYCLYkM90fFy0a0s05XppVLDke93Fk	160.113.1.238/get-session	1	1765875904427
NIqMWkCGp6WPz1Gvq1lk7w6sizAuEtv3	160.113.21.55/get-session	1	1767349561577
PRQMaTgmiwxaYEekqA25GMqAKCd6sicT	197.214.239.237/get-session	1	1767350786202
HHuxgxegs4pzZfT7xm3HMPLU30Wsaryy	102.204.124.31/sign-out	1	1767782033388
D0YPZyMxX1W0pZ7Ma0QyVXKR2dNcSRbn	102.204.124.31/get-session	1	1767782034859
4htjHipq7tOYg9bSJGC2qXTkgGPoM5nm	160.113.21.41/get-session	1	1766110347442
X2d62V1xuY3mFJSDExXMpClRjGegRENk	197.214.239.172/get-session	1	1767368363813
bUGCYocMDBX0b1BcSUx4U5MFQs576uTe	197.214.239.48/get-session	1	1767369738515
OcKd7GeHboNih467i15ksidXNXsO91p1	160.113.21.24/get-session	1	1766220817219
qXKWzJBrHzBPWrNUtNEvDJ6U0sJvKMmk	160.113.1.128/get-session	1	1766242580820
xQpb8oy2fDCEVBxuUxVsPrLLYUxsRmVq	160.113.21.16/get-session	1	1766247312032
2jXOaLG8TY5hOVvaz1RVbQl29QQpfOTB	160.113.21.48/get-session	1	1766284075106
EzVHtfynA5G474dsv2151rH7tKcxy5MI	146.75.166.55/sign-in/email	1	1766736441011
jxm4B2yAYijhii0KumL2RzkvIjfiO2LN	146.75.166.55/get-session	1	1766736445024
BVSOBNcbRbiDZvzJZueYu15rWIVBQSep	146.75.166.55/get-session	1	1766736445025
Vwr6cgc4Ksza6oOS8p5NOJaAWNAvxbcA	104.28.42.14/get-session	1	1766750473564
cyqYJuFZxCcxFm5vcZbj7XoVLyGZtKXC	172.224.230.118/get-session	1	1765379746667
aVC00s3NMpI1EDEudZ10jIKYogdKlNWW	169.255.151.4/sign-in/email	1	1765957969093
ZMSjANkcBx2JuEIAiByJa9V1tF7F8ql4	146.75.166.54/get-session	1	1766828741054
QnQYtxaKV85NJlKqUdRfvcpYGvpH2wVU	140.248.41.30/get-session	1	1766908402699
zbfXXfrbMNfdVxLxn0dQ09i7FeWVGGSj	160.113.1.156/sign-in/email	1	1766935570461
MWpmpwLL84H2ZeNxvGq7HYckNzJZ4DhT	160.113.1.156/get-session	2	1766935598335
WPcgWxjqt08WgYESe4EcSEvfYyPdluVz	160.113.1.229/get-session	1	1765573956211
FJOWFIT1IGSv4jOu0uNaqqob9h5HPMrM	160.113.21.32/get-session	1	1765646663694
KmFpBkkyay0Pq4i0kUyf61DkOENyYNrN	102.204.124.10/sign-in/email	1	1765814160480
RQDiBSqhzvRp3aLLiu344uZtThOSBCah	160.113.21.33/get-session	1	1766961567556
JufGMtKru5RyTnlxQt3ciUMdWGvvYFNI	160.113.1.233/get-session	1	1766975801754
lOOmm4YQnONsqComED2fAGn6ncXiVAuS	160.113.1.149/get-session	1	1767396488546
WCs2Y4ejIdVJMEa1dqMo4IIOquOigpvI	160.113.21.36/get-session	1	1767009571123
Fh4O0BfbC6diDAPRU3xB5eicx9jLoCvw	160.113.1.150/get-session	1	1767437724600
dJWm7xtIIQtOr5kYKutEJKBqhCRsamdO	160.113.1.135/get-session	1	1767461303187
mAdWpW4RFwDsFYkcFIMPQP2NVbwUnGgi	160.113.1.151/sign-in/email	1	1767584925222
s8uGEbCpF2LbMvX2zhFrSDSDXOsJsow5	160.113.1.151/get-session	1	1767585880141
4DdNUG0ZBC4uAjhVnr5amVs5p9leHSxw	82.124.57.159/sign-in/email	1	1767101140162
psjrzuHU1bGcDOZOADiNYM0xakme7OaG	104.28.42.25/get-session	1	1767101366896
9dYThNI5E0S8B7H8yYEE0YvsoushrWcf	102.204.124.10/get-session	1	1767796424707
lBoXbiRynDr1XA2LwKvDpOEeH5sfknA8	169.255.151.4/get-session	1	1765965335932
m1MuDUle6QbyNWNGq3lvW0ETWXTt6f76	169.255.151.4/get-session	1	1765965335932
KqrWbet8wm2ez1MBP14RMukyvzmLcwZL	140.248.41.31/sign-in/email	1	1767682875765
LmQDSZxxua1QCUcl45XzyXsjTnrWc8Mv	160.119.185.53/sign-in/email	1	1765973647633
ahjQ6aVFOGnOF1XZTBEapEb1aQUORXrz	140.248.41.31/get-session	1	1767683111501
tBhjteCcr2Z2OFiKcyrh3yJpvz1ibllC	82.124.57.159/get-session	1	1767683439902
YRspYTuqaSmc0YbMl3v3mMavG0gCYUn1	197.214.239.122/sign-in/email	1	1767105572775
3dD8Ky4e6crH0htXBNOfJ78zcD4wHjNf	197.214.239.122/get-session	2	1767105588917
0fkA4nOT1Exy5EkiUviLqcCvx4Hcno72	104.28.42.15/get-session	1	1767683519537
69iT16Ptz87ygDUVxgyVYpqd1iaBPvoX	104.28.42.15/get-session	1	1767683519604
lF2cJB43cEXHc1GjPLXTszxjSDHA9irB	172.226.148.45/get-session	1	1767777070504
cPIIKu1HgNL7sfr4cNjTbCKypeYImFhA	197.214.239.162/get-session	1	1767777384631
wwa3fGAsezdAUzEbTcc14b7jyyWNdlHJ	102.204.124.31/sign-in/email	1	1767777593681
\.


--
-- Data for Name: receipt; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.receipt (id, type, "hasDelete", reference, date, movement, "categoryId", "natureId", amount, "amountType", "paymentType", "checkNumber", "referenceInvoiceId", "sourceId", description, comment, "clientId", "supplierId", "companyId", "paymentId", "updatedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: recurrence; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.recurrence (id, repeat, "invoiceId", "purchaseOrderId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.session (id, "expiresAt", token, "ipAddress", "userAgent", "userId", "impersonatedBy", "updatedAt", "createdAt") FROM stdin;
gPZ8oGP6O0M1dc1E26QXWbVRBl1VS7zY	2025-12-15 14:15:37.559	Tbr0Z7XyERRQen7idisx0ZiIJ3lRy8B9			Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-08 14:15:37.559	2025-12-08 14:15:37.559
zJ1ENIt8vIaZSKxtax1nOT7n5ibCZ4Kz	2025-12-15 14:50:19.667	mCp2Mr3oC2G7qdMweTYUPoEMRVmZrWZQ			1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	\N	2025-12-08 14:50:19.668	2025-12-08 14:50:19.668
8VG82BaDB0wsnMKzOSQhdOU19WauBFKP	2026-01-06 13:21:39.668	m5jq0MQqtCUYXtsGXMcZM4OXbWZgZ29B	146.75.166.55	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-30 13:21:39.668	2025-12-26 08:07:22.166
EfpJKp8p4S4rSIglWcWhY3ydMTtmufMt	2026-01-06 13:25:19.251	mpHIMl1tiobwA1qNXNI2YMPE9NoMMHbV			R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	\N	2025-12-30 13:25:19.251	2025-12-30 13:25:19.251
YGvMibRq8GD3VgxPJIbFr65tvHebXAPu	2025-12-17 15:15:20.547	cZnnxBJTAJnAvrYuBuBkPLvuHzcPJlIs	169.255.151.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-10 15:15:20.547	2025-12-08 14:44:51.333
JGrd9Zy1bHhikPxJuPu2WYpp9ADQ7QaG	2026-01-06 14:39:33.104	fQMdZs6s0lnGrlQ8MbAQPaVyUAqEpaMp	197.214.239.122	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	\N	2025-12-30 14:39:33.105	2025-12-30 14:39:33.105
apDBrTXLYkyFP41t6UboiNIVzkWnCrwo	2025-12-22 15:28:03.497	E9TZpI9W8SaHi3WCdK6sLUd9FZ09UqW7	102.204.124.10	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-15 15:28:03.497	2025-12-08 15:43:21.535
eDdl50itPtFKo4cpVY5V0EBINrPJvrDc	2025-12-23 15:54:47.888	L3PghBx3J8brSfT71GlSTXNNxfv7YGqn	169.255.151.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	\N	2025-12-16 15:54:47.888	2025-12-16 15:54:47.888
8y3j3D3ZpskcUMKtWaqWp7OEttTBwVNA	2025-12-24 07:48:56.027	9VDlayrMU5ilmNX8MRUzXZHwTUxTJ9nN	169.255.151.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-17 07:48:56.027	2025-12-15 16:00:01.149
2RLt2I0l32QXgYeDlUJLVzrJBOrqWFmH	2025-12-24 07:52:26.008	DGBlSMLtOJW7dzBrmP1HMk4BRNgD3Uxr			bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	\N	2025-12-17 07:52:26.008	2025-12-17 07:52:26.008
kNMrRASkeEkCsQJcPmjOYGobARUDhWRa	2025-12-24 07:52:49.759	RT1GxmcbDg9RSoKbD8DBZesXR0pB3VeW	169.255.151.4	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	\N	2025-12-17 07:52:49.759	2025-12-17 07:52:49.759
xdRKxfzu6HGhKEmF1bAIV18FGeblvF9F	2026-01-11 12:44:47.062	V9XNfNbvOPSk0NCTJOKQUjsQXdOmeWUS	160.113.1.156	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2026-01-04 12:44:47.062	2025-12-28 15:26:11.409
kuAZbovmdrU0nU7qzEYlb9te8Bur8AlK	2025-12-27 16:15:10.805	D5bz2VK0jWDtdL0Im49CThY2D7KIyjPV	102.204.124.10	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2025-12-20 16:15:10.805	2025-12-15 15:56:01.109
3HuxjAbwVUurNsp6hgHqomq3VCjijVQx	2026-01-13 07:10:33.209	8fmS3Hjsu5q9bC54OrcRLSmBhIqPeZkc	82.124.57.159	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	\N	2026-01-06 07:10:33.209	2025-12-30 13:25:40.616
0xyrdgkHeKFjrwpYsrMytCD6yWVAJffV	2026-01-14 09:02:02.743	vn9SLNvLQevdVNLJHe0k4WHA7mu9IBMw	140.248.41.31	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2026-01-07 09:02:02.743	2026-01-06 07:01:31.46
gnIeti2GfAkhUZlaHNbadACx6Q1mfZ8z	2026-01-14 09:15:40.402	4P4mnQNslMM34VH0ll7ah7gxZtBSl1ZM	160.113.1.151	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	\N	2026-01-07 09:15:40.402	2026-01-05 03:48:46.321
\.


--
-- Data for Name: source; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.source (id, name, "sourceType", "companyId") FROM stdin;
01KC1XA9V3XBD08WKTY9FN7D8W	Caisse	CASH	ffce5ace-7101-4296-be7e-35028d6bbcf9
01KC1XCGXWYEKTNTWV7T8G5322	BGFIBank	BANK	ffce5ace-7101-4296-be7e-35028d6bbcf9
\.


--
-- Data for Name: structure_type; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.structure_type (id, name, "companyId") FROM stdin;
321631f3-3e3c-47be-9ba7-7ca4267c5c8c	Acier	ffce5ace-7101-4296-be7e-35028d6bbcf9
\.


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.supplier (id, "companyName", firstname, "hasDelete", lastname, phone, email, "businessSector", website, "paidAmount", due, job, "legalForms", capital, address, "businessRegistrationNumber", "taxIdentificationNumber", discount, "paymentTerms", information, path, "uploadDocuments", "companyId", "createdAt", "updatedAt") FROM stdin;
6525523a-e251-47a6-b02e-993855ef0b7b	Mairie Centrale de Pointe-Noire	Junior	f	Pabou Mbaki	+242 06 911 24 53	junior.paboumbaki@pointenoire.cg	services_juridiques		0.00	0.00	Directeur de la Communication	NC	NC	Av. du General De Gaule, Pointe-Noire, Congo	NC	NC	0%	paiement_90_jours		atlas_congo/supplier/junior_pabou_mbaki	{}	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-09 14:29:28.48	2025-12-09 14:29:28.48
5e4d2f71-44a0-4d78-b84b-d99aaec9a1f4	LF PRINTING	Vincent 	f	Belval 	077 83 99 44	vincent@lfgabon.com	textile		0.00	3142500.00	Directeur Général 	Néant 	0	Oloumi 	0000	0000	0%	paiement_120_jours		atlas_gabon/supplier/vincent__belval	{}	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-16 16:20:06.078	2025-12-26 12:07:34.248
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.task (id, "taskName", "desc", path, "time", priority, comment, file, status, "projectId") FROM stdin;
\.


--
-- Data for Name: task_step; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.task_step (id, "stepName", "check", "taskId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transaction_category; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.transaction_category (id, name, type, "companyId", "updatedAt", "createdAt") FROM stdin;
01KBZ6Z1MRKB67DD4CEJEZ74ST	Transfert CaC	RECEIPT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MR5C8AJ9BHT1WJWPRQ	Règlement loyer	DISBURSEMENT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MRD0M0G332F9K6NZ21	Règlement salaire	DISBURSEMENT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MRFH17321QTH6T9CQZ	Règlement prestation de service	DISBURSEMENT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MR0JCW6382P9M83DQZ	Règlement fournisseur	DISBURSEMENT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MR4A0PZXPT87Y5AJ20	Règlement client	RECEIPT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ6Z1MSSNXWYYFWDJXAAX9E	Administration	DISBURSEMENT	6bed2352-3d37-45d8-8e48-595a1533b08f	2025-12-08 14:48:33.176	2025-12-08 14:48:33.176
01KBZ7QQ5GJANBZ1PE9MBC3MNX	Règlement loyer	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-08 15:02:01.648	2025-12-08 15:02:01.648
01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	Règlement salaire	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-08 15:02:01.648	2025-12-08 15:02:01.648
01KBZ7QQ5G762PW22CHGR71QSP	Règlement fournisseur	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-08 15:02:01.648	2025-12-08 15:02:01.648
01KBZ7QQ5GXEEQ5JVZQHVFBJK2	Règlement client	RECEIPT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-08 15:02:01.648	2025-12-08 15:02:01.648
01KBZ7QQ5HN86YKX5W6BD72SGG	Administration	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-08 15:02:01.648	2025-12-08 15:02:01.648
01KDCVY2G6R04AY82C5579C5TV	Frais de fonctionnement	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2025-12-26 08:20:50.823	2025-12-26 08:20:50.823
01KDQRB6ATB75QY4CXSERR929A	Transfert CaC	RECEIPT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6ATA6JCBD7YDBNVS007	Règlement loyer	DISBURSEMENT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6ATA2WFF611N911PK2Y	Règlement salaire	DISBURSEMENT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6ATR932YBF5H1Z75C66	Règlement prestation de service	DISBURSEMENT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6AT0C38WX92GF2MJCD6	Règlement fournisseur	DISBURSEMENT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6ATVE9B9WEYVDJ9B4BN	Règlement client	RECEIPT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KDQRB6ATK22VDRXBPTHMD3DH	Administration	DISBURSEMENT	0da6b7ad-d5cd-4bec-9563-cdcceb064332	2025-12-30 13:49:45.178	2025-12-30 13:49:45.178
01KEBW9XAFB78DWJSXP6R78ECT	VIDANGE KAVAKI	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:23:46.128	2026-01-07 09:23:46.128
01KEBX2HX5J74ZBX2S3XB8C96D	Bombone EAU	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 09:37:13.637	2026-01-07 09:37:13.637
01KEBZKAFVANBXJCFG3N3YQ4VG	TRANSPORT	DISBURSEMENT	ffce5ace-7101-4296-be7e-35028d6bbcf9	2026-01-07 10:21:20.251	2026-01-07 10:21:20.251
\.


--
-- Data for Name: transaction_nature; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.transaction_nature (id, name, "categoryId", "companyId") FROM stdin;
7181478d-d7cc-42e5-93ba-3394d6b04623	Fiscal	01KBZ6Z1MSSNXWYYFWDJXAAX9E	6bed2352-3d37-45d8-8e48-595a1533b08f
223e4b4a-751a-4830-ba69-ed421f308fb3	Fiscal	01KBZ7QQ5HN86YKX5W6BD72SGG	ffce5ace-7101-4296-be7e-35028d6bbcf9
9b233555-e9a8-459d-9462-1aea4c0bcd90	Materiel aciers	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
58d10e81-f73c-4bee-a3c7-10593ea21f07	Municipale	01KBZ7QQ5HN86YKX5W6BD72SGG	ffce5ace-7101-4296-be7e-35028d6bbcf9
7b43da29-f446-4477-b47f-1de8327ffeb1	Nicolas	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
17830f9c-506d-4b4f-a897-d3a144f18519	Ghislain	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
77281a3c-ffcc-474c-a5e6-1051a42983ee	Taylor	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
5cbea732-baf8-4480-a843-3acaf1bc47ab	Sandy	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
4119bd25-214b-4c1a-8e29-d0573e21a5c0	Alexia	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
cd10fb17-adc4-4890-a536-d162199c85af	Marie	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
92aafd3c-91b7-41c3-aae1-37c29c485fbb	Roll	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
257dfc2e-1f38-402f-baa5-42fb84322f6e	Brondon	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
cc93e0b5-6d94-4a81-8d8c-629058699e7f	Florly	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
c79bea75-71df-419c-9a48-6f8f83cee033	Ardeche	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
ed8dd254-050a-49ee-bc5b-9e58738d5582	Prince	01KBZ7QQ5GE4AMB8X2Q7ZQFW3X	ffce5ace-7101-4296-be7e-35028d6bbcf9
72877359-e92b-4b8c-bbca-739f6716c7ff	Co.dis.co	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
4a5e9e70-8eb0-4a66-b750-a2118dfe0240	Saint-Eudes	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
9bb2b666-e14c-4573-8169-5762b95e6f79	Aimé Soudure	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
2447caf4-16fb-4f43-9b9a-f89aa1bcae8c	Bureau Commercial	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
b42eba6b-0628-45fc-bc8d-10d39dd6ea8e	Bureau Direction	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
6acbab6c-ba82-416b-909a-3fa146d206a7	Bureau Technique	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
00f2b05f-f629-4110-a65a-382ce4e037c0	Broderie	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
69f6de8c-da8f-49fa-9912-7f27587ff8cd	Stock	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
852fd387-1092-443d-a16f-ff7cb6bfb93b	Dépot PNR	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
2df2d48a-8230-4426-b4c2-a487c1e324e6	Dépôt BZV	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
5f480d83-865b-49fd-8b28-c75881a758d4	Facade Loemba (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
c46fcb4c-0408-4906-9989-1f5dc7bde509	Facade Benzada (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
be1fc0f0-c19b-454e-add6-9a546ce0c669	Facade CFCO (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
924f12d5-ed1b-484e-8b2a-573ff1da817f	Facade Ex-Bata (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
fedfb45a-d156-4e1f-844b-eafd15b22f94	Facade Tari (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
f097e5f5-9220-43a0-b686-366aab165e6f	Facade Foch (BZV)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
a7588b12-1442-43f8-93b7-217fac6ca9b4	Facade Lincoln (PNR)	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
d8256b99-c41a-40a6-9b96-c1144c7efbac	Dons	01KDCVY2G6R04AY82C5579C5TV	ffce5ace-7101-4296-be7e-35028d6bbcf9
6a9b8858-9a3b-461a-84a8-a429fa9f499b	Commissions	01KDCVY2G6R04AY82C5579C5TV	ffce5ace-7101-4296-be7e-35028d6bbcf9
f412d462-90cf-4852-b97a-66bc862067ad	Télécommunication	01KDCVY2G6R04AY82C5579C5TV	ffce5ace-7101-4296-be7e-35028d6bbcf9
edba9afd-a2d6-468c-97bb-c951e1d0272e	Carburant	01KDCVY2G6R04AY82C5579C5TV	ffce5ace-7101-4296-be7e-35028d6bbcf9
2cae91c8-fd58-495c-84d3-c51ef3903f09	Fiscal	01KDQRB6ATK22VDRXBPTHMD3DH	0da6b7ad-d5cd-4bec-9563-cdcceb064332
85e2b561-1689-43b3-a986-88e28fc0c87d	Vidange Kavaki	01KEBW9XAFB78DWJSXP6R78ECT	ffce5ace-7101-4296-be7e-35028d6bbcf9
3209553d-f94e-4781-90c4-c5b7c22b9bcd	Bombone Eau	01KEBX2HX5J74ZBX2S3XB8C96D	ffce5ace-7101-4296-be7e-35028d6bbcf9
b269c2d4-c260-46ea-98ab-cb31675c4178	MELID	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
ebb296a1-ee3f-40b3-8f09-7b3bb754e410	Loyer Bacongo	01KBZ7QQ5GJANBZ1PE9MBC3MNX	ffce5ace-7101-4296-be7e-35028d6bbcf9
1445deef-cf90-47e5-97e9-4c7fc2a92ae1	Cabinet Synergy	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
b729b572-4e11-4424-ad67-16619c22a4b4	fournisseurs divers	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
cd8af921-f12c-4bcb-bf8a-7fc1e2e5bfcc	CHRISTOPHER	01KEBZKAFVANBXJCFG3N3YQ4VG	ffce5ace-7101-4296-be7e-35028d6bbcf9
863a1872-0ffb-4627-9e06-4db508d54e08	ORIGINAL+	01KBZ7QQ5G762PW22CHGR71QSP	ffce5ace-7101-4296-be7e-35028d6bbcf9
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public."user" (id, name, email, role, "emailVerified", "currentCompany", "currentProfile", banned, "banReason", "banExpires", "updatedAt", "createdAt") FROM stdin;
1yUHNvfnfBqFGJqwL0QYo4XraWaV48nw	Alexandre Vesmare	alexandre.vesmare@atlasgabon.com	USER	f	6bed2352-3d37-45d8-8e48-595a1533b08f	f6413675-5272-4423-91d7-2aaf9553db6d	\N	\N	\N	2025-12-08 14:50:19.697	2025-12-08 14:50:19.656
bSYH4InUZGNSPPOmbhcYLqOc9XehJCMh	Paul Jean	notorious3fr@yahoo.fr	USER	f	ffce5ace-7101-4296-be7e-35028d6bbcf9	e5067488-ea10-4458-b0e5-4cdbcedb81af	\N	\N	\N	2025-12-17 07:52:26.031	2025-12-17 07:52:25.995
R2RcbWwKtykxROI8wXLWLzwl4LzqYfHK	Dan Tchitembo	dan.tchitembo@atlascongo.com	USER	f	ffce5ace-7101-4296-be7e-35028d6bbcf9	0886c61d-e56f-44e3-bbcb-b5335830716b	\N	\N	\N	2025-12-30 14:42:19.517	2025-12-30 13:25:19.22
Bhf5R6i15Ph8JiUH6YulS8k2qZnivTql	Ralph Pinto	ralph.pinto@atlasmediaafrica.com	ADMIN	f	ffce5ace-7101-4296-be7e-35028d6bbcf9	\N	\N	\N	\N	2026-01-07 09:03:57.198	2025-12-08 14:15:37.55
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: upside
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: contract_contractNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public."contract_contractNumber_seq"', 1, false);


--
-- Name: delivery_note_deliveryNoteNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public."delivery_note_deliveryNoteNumber_seq"', 1, false);


--
-- Name: dibursement_reference_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public.dibursement_reference_seq', 6, true);


--
-- Name: invoice_invoiceNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public."invoice_invoiceNumber_seq"', 1, false);


--
-- Name: profile_key_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public.profile_key_seq', 5, true);


--
-- Name: purchase_order_purchaseOrderNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public."purchase_order_purchaseOrderNumber_seq"', 1, true);


--
-- Name: quote_quoteNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public."quote_quoteNumber_seq"', 1, false);


--
-- Name: receipt_reference_seq; Type: SEQUENCE SET; Schema: public; Owner: upside
--

SELECT pg_catalog.setval('public.receipt_reference_seq', 1, false);


--
-- Name: _BillboardToDeliveryNote _BillboardToDeliveryNote_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToDeliveryNote"
    ADD CONSTRAINT "_BillboardToDeliveryNote_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _BillboardToInvoice _BillboardToInvoice_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToInvoice"
    ADD CONSTRAINT "_BillboardToInvoice_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _BillboardToQuote _BillboardToQuote_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToQuote"
    ADD CONSTRAINT "_BillboardToQuote_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ContractToInvoice _ContractToInvoice_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ContractToInvoice"
    ADD CONSTRAINT "_ContractToInvoice_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _DeliveryNoteToProductService _DeliveryNoteToProductService_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DeliveryNoteToProductService"
    ADD CONSTRAINT "_DeliveryNoteToProductService_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _DibursementToSupplier _DibursementToSupplier_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DibursementToSupplier"
    ADD CONSTRAINT "_DibursementToSupplier_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _InvoiceToProductService _InvoiceToProductService_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_InvoiceToProductService"
    ADD CONSTRAINT "_InvoiceToProductService_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProductServiceToPurchaseOrder _ProductServiceToPurchaseOrder_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToPurchaseOrder"
    ADD CONSTRAINT "_ProductServiceToPurchaseOrder_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProductServiceToQuote _ProductServiceToQuote_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToQuote"
    ADD CONSTRAINT "_ProductServiceToQuote_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: _project_collaborators _project_collaborators_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._project_collaborators
    ADD CONSTRAINT "_project_collaborators_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _task_users _task_users_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._task_users
    ADD CONSTRAINT "_task_users_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: allocation allocation_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.allocation
    ADD CONSTRAINT allocation_pkey PRIMARY KEY (id);


--
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (id);


--
-- Name: area area_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_pkey PRIMARY KEY (id);


--
-- Name: billboard billboard_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT billboard_pkey PRIMARY KEY (id);


--
-- Name: billboard_type billboard_type_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard_type
    ADD CONSTRAINT billboard_type_pkey PRIMARY KEY (id);


--
-- Name: city city_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_pkey PRIMARY KEY (id);


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- Name: company_documents company_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT company_documents_pkey PRIMARY KEY (id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (id);


--
-- Name: deletion deletion_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.deletion
    ADD CONSTRAINT deletion_pkey PRIMARY KEY (id);


--
-- Name: delivery_note delivery_note_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT delivery_note_pkey PRIMARY KEY (id);


--
-- Name: dibursement_data dibursement_data_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement_data
    ADD CONSTRAINT dibursement_data_pkey PRIMARY KEY (id);


--
-- Name: dibursement dibursement_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT dibursement_pkey PRIMARY KEY (id);


--
-- Name: display_board display_board_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.display_board
    ADD CONSTRAINT display_board_pkey PRIMARY KEY (id);


--
-- Name: fiscal_object fiscal_object_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.fiscal_object
    ADD CONSTRAINT fiscal_object_pkey PRIMARY KEY (id);


--
-- Name: invoice invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT invoice_pkey PRIMARY KEY (id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- Name: lessor_type lessor_type_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.lessor_type
    ADD CONSTRAINT lessor_type_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_read notification_read_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification_read
    ADD CONSTRAINT notification_read_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: product_service product_service_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.product_service
    ADD CONSTRAINT product_service_pkey PRIMARY KEY (id);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (id);


--
-- Name: quote quote_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT quote_pkey PRIMARY KEY (id);


--
-- Name: rateLimit rateLimit_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."rateLimit"
    ADD CONSTRAINT "rateLimit_pkey" PRIMARY KEY (id);


--
-- Name: receipt receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT receipt_pkey PRIMARY KEY (id);


--
-- Name: recurrence recurrence_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.recurrence
    ADD CONSTRAINT recurrence_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: source source_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.source
    ADD CONSTRAINT source_pkey PRIMARY KEY (id);


--
-- Name: structure_type structure_type_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.structure_type
    ADD CONSTRAINT structure_type_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: task task_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- Name: task_step task_step_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.task_step
    ADD CONSTRAINT task_step_pkey PRIMARY KEY (id);


--
-- Name: transaction_category transaction_category_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.transaction_category
    ADD CONSTRAINT transaction_category_pkey PRIMARY KEY (id);


--
-- Name: transaction_nature transaction_nature_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.transaction_nature
    ADD CONSTRAINT transaction_nature_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: _BillboardToDeliveryNote_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_BillboardToDeliveryNote_B_index" ON public."_BillboardToDeliveryNote" USING btree ("B");


--
-- Name: _BillboardToInvoice_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_BillboardToInvoice_B_index" ON public."_BillboardToInvoice" USING btree ("B");


--
-- Name: _BillboardToQuote_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_BillboardToQuote_B_index" ON public."_BillboardToQuote" USING btree ("B");


--
-- Name: _ContractToInvoice_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_ContractToInvoice_B_index" ON public."_ContractToInvoice" USING btree ("B");


--
-- Name: _DeliveryNoteToProductService_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_DeliveryNoteToProductService_B_index" ON public."_DeliveryNoteToProductService" USING btree ("B");


--
-- Name: _DibursementToSupplier_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_DibursementToSupplier_B_index" ON public."_DibursementToSupplier" USING btree ("B");


--
-- Name: _InvoiceToProductService_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_InvoiceToProductService_B_index" ON public."_InvoiceToProductService" USING btree ("B");


--
-- Name: _ProductServiceToPurchaseOrder_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_ProductServiceToPurchaseOrder_B_index" ON public."_ProductServiceToPurchaseOrder" USING btree ("B");


--
-- Name: _ProductServiceToQuote_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_ProductServiceToQuote_B_index" ON public."_ProductServiceToQuote" USING btree ("B");


--
-- Name: _project_collaborators_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_project_collaborators_B_index" ON public._project_collaborators USING btree ("B");


--
-- Name: _task_users_B_index; Type: INDEX; Schema: public; Owner: upside
--

CREATE INDEX "_task_users_B_index" ON public._task_users USING btree ("B");


--
-- Name: company_companyName_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "company_companyName_key" ON public.company USING btree ("companyName");


--
-- Name: company_documents_companyId_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "company_documents_companyId_key" ON public.company_documents USING btree ("companyId");


--
-- Name: company_email_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX company_email_key ON public.company USING btree (email);


--
-- Name: deletion_recordId_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "deletion_recordId_key" ON public.deletion USING btree ("recordId");


--
-- Name: dibursement_paymentId_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "dibursement_paymentId_key" ON public.dibursement USING btree ("paymentId");


--
-- Name: notification_read_notificationId_userId_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "notification_read_notificationId_userId_key" ON public.notification_read USING btree ("notificationId", "userId");


--
-- Name: permission_profileId_resource_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "permission_profileId_resource_key" ON public.permission USING btree ("profileId", resource);


--
-- Name: receipt_paymentId_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX "receipt_paymentId_key" ON public.receipt USING btree ("paymentId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: upside
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: _BillboardToDeliveryNote _BillboardToDeliveryNote_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToDeliveryNote"
    ADD CONSTRAINT "_BillboardToDeliveryNote_A_fkey" FOREIGN KEY ("A") REFERENCES public.billboard(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BillboardToDeliveryNote _BillboardToDeliveryNote_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToDeliveryNote"
    ADD CONSTRAINT "_BillboardToDeliveryNote_B_fkey" FOREIGN KEY ("B") REFERENCES public.delivery_note(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BillboardToInvoice _BillboardToInvoice_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToInvoice"
    ADD CONSTRAINT "_BillboardToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES public.billboard(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BillboardToInvoice _BillboardToInvoice_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToInvoice"
    ADD CONSTRAINT "_BillboardToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BillboardToQuote _BillboardToQuote_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToQuote"
    ADD CONSTRAINT "_BillboardToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES public.billboard(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BillboardToQuote _BillboardToQuote_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_BillboardToQuote"
    ADD CONSTRAINT "_BillboardToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES public.quote(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ContractToInvoice _ContractToInvoice_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ContractToInvoice"
    ADD CONSTRAINT "_ContractToInvoice_A_fkey" FOREIGN KEY ("A") REFERENCES public.contract(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ContractToInvoice _ContractToInvoice_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ContractToInvoice"
    ADD CONSTRAINT "_ContractToInvoice_B_fkey" FOREIGN KEY ("B") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DeliveryNoteToProductService _DeliveryNoteToProductService_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DeliveryNoteToProductService"
    ADD CONSTRAINT "_DeliveryNoteToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES public.delivery_note(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DeliveryNoteToProductService _DeliveryNoteToProductService_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DeliveryNoteToProductService"
    ADD CONSTRAINT "_DeliveryNoteToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES public.product_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DibursementToSupplier _DibursementToSupplier_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DibursementToSupplier"
    ADD CONSTRAINT "_DibursementToSupplier_A_fkey" FOREIGN KEY ("A") REFERENCES public.dibursement(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DibursementToSupplier _DibursementToSupplier_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_DibursementToSupplier"
    ADD CONSTRAINT "_DibursementToSupplier_B_fkey" FOREIGN KEY ("B") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InvoiceToProductService _InvoiceToProductService_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_InvoiceToProductService"
    ADD CONSTRAINT "_InvoiceToProductService_A_fkey" FOREIGN KEY ("A") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _InvoiceToProductService _InvoiceToProductService_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_InvoiceToProductService"
    ADD CONSTRAINT "_InvoiceToProductService_B_fkey" FOREIGN KEY ("B") REFERENCES public.product_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductServiceToPurchaseOrder _ProductServiceToPurchaseOrder_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToPurchaseOrder"
    ADD CONSTRAINT "_ProductServiceToPurchaseOrder_A_fkey" FOREIGN KEY ("A") REFERENCES public.product_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductServiceToPurchaseOrder _ProductServiceToPurchaseOrder_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToPurchaseOrder"
    ADD CONSTRAINT "_ProductServiceToPurchaseOrder_B_fkey" FOREIGN KEY ("B") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductServiceToQuote _ProductServiceToQuote_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToQuote"
    ADD CONSTRAINT "_ProductServiceToQuote_A_fkey" FOREIGN KEY ("A") REFERENCES public.product_service(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductServiceToQuote _ProductServiceToQuote_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public."_ProductServiceToQuote"
    ADD CONSTRAINT "_ProductServiceToQuote_B_fkey" FOREIGN KEY ("B") REFERENCES public.quote(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _project_collaborators _project_collaborators_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._project_collaborators
    ADD CONSTRAINT "_project_collaborators_A_fkey" FOREIGN KEY ("A") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _project_collaborators _project_collaborators_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._project_collaborators
    ADD CONSTRAINT "_project_collaborators_B_fkey" FOREIGN KEY ("B") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _task_users _task_users_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._task_users
    ADD CONSTRAINT "_task_users_A_fkey" FOREIGN KEY ("A") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _task_users _task_users_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public._task_users
    ADD CONSTRAINT "_task_users_B_fkey" FOREIGN KEY ("B") REFERENCES public.task(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: allocation allocation_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.allocation
    ADD CONSTRAINT "allocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: allocation allocation_natureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.allocation
    ADD CONSTRAINT "allocation_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES public.transaction_nature(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment appointment_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointment appointment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointment appointment_teamMemberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT "appointment_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: area area_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT "area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.city(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: area area_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT "area_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billboard billboard_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public.area(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: billboard billboard_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.city(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: billboard billboard_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: billboard billboard_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billboard billboard_displayBoardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_displayBoardId_fkey" FOREIGN KEY ("displayBoardId") REFERENCES public.display_board(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billboard billboard_lessorSupplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_lessorSupplierId_fkey" FOREIGN KEY ("lessorSupplierId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: billboard billboard_lessorTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_lessorTypeId_fkey" FOREIGN KEY ("lessorTypeId") REFERENCES public.lessor_type(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: billboard billboard_structureTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_structureTypeId_fkey" FOREIGN KEY ("structureTypeId") REFERENCES public.structure_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: billboard billboard_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard
    ADD CONSTRAINT "billboard_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public.billboard_type(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: billboard_type billboard_type_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.billboard_type
    ADD CONSTRAINT "billboard_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: city city_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "city_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: client client_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT "client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: company_documents company_documents_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.company_documents
    ADD CONSTRAINT "company_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract contract_billboardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT "contract_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES public.billboard(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contract contract_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT "contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contract contract_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT "contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contract contract_lessorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT "contract_lessorId_fkey" FOREIGN KEY ("lessorId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deletion deletion_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.deletion
    ADD CONSTRAINT "deletion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deletion deletion_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.deletion
    ADD CONSTRAINT "deletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: delivery_note delivery_note_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT "delivery_note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_note delivery_note_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT "delivery_note_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: delivery_note delivery_note_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT "delivery_note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: delivery_note delivery_note_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.delivery_note
    ADD CONSTRAINT "delivery_note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dibursement dibursement_allocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES public.allocation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dibursement dibursement_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.transaction_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dibursement dibursement_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dibursement dibursement_fiscalObjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_fiscalObjectId_fkey" FOREIGN KEY ("fiscalObjectId") REFERENCES public.fiscal_object(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_natureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES public.transaction_nature(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dibursement dibursement_payOnBehalfOfId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_payOnBehalfOfId_fkey" FOREIGN KEY ("payOnBehalfOfId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dibursement dibursement_referenceInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_referencePurchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_referencePurchaseOrderId_fkey" FOREIGN KEY ("referencePurchaseOrderId") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dibursement dibursement_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.dibursement
    ADD CONSTRAINT "dibursement_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public.source(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: display_board display_board_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.display_board
    ADD CONSTRAINT "display_board_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fiscal_object fiscal_object_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.fiscal_object
    ADD CONSTRAINT "fiscal_object_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice invoice_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice invoice_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice invoice_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice invoice_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.invoice
    ADD CONSTRAINT "invoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: item item_billboardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES public.billboard(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: item item_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: item item_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.delivery_note(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: item item_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: item item_productServiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_productServiceId_fkey" FOREIGN KEY ("productServiceId") REFERENCES public.product_service(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: item item_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: item item_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT "item_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public.quote(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lessor_type lessor_type_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.lessor_type
    ADD CONSTRAINT "lessor_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification notification_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public.appointment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification notification_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.delivery_note(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_dibursementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_dibursementId_fkey" FOREIGN KEY ("dibursementId") REFERENCES public.dibursement_data(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_paymentDibursementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_paymentDibursementId_fkey" FOREIGN KEY ("paymentDibursementId") REFERENCES public.dibursement(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public.quote(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_read notification_read_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification_read
    ADD CONSTRAINT "notification_read_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_read notification_read_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification_read
    ADD CONSTRAINT "notification_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_receiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES public.receipt(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.task(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT "payment_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: permission permission_profileId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "permission_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_service product_service_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.product_service
    ADD CONSTRAINT "product_service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: profile profile_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "profile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: profile profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project project_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project project_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order purchase_order_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT "purchase_order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order purchase_order_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT "purchase_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order purchase_order_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT "purchase_order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order purchase_order_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote quote_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT "quote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quote quote_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT "quote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quote quote_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT "quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quote quote_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.quote
    ADD CONSTRAINT "quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipt receipt_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.transaction_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipt receipt_clientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES public.client(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: receipt receipt_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: receipt receipt_natureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_natureId_fkey" FOREIGN KEY ("natureId") REFERENCES public.transaction_nature(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: receipt receipt_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: receipt receipt_referenceInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_referenceInvoiceId_fkey" FOREIGN KEY ("referenceInvoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: receipt receipt_sourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES public.source(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: receipt receipt_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.receipt
    ADD CONSTRAINT "receipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recurrence recurrence_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.recurrence
    ADD CONSTRAINT "recurrence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurrence recurrence_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.recurrence
    ADD CONSTRAINT "recurrence_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoice(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurrence recurrence_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.recurrence
    ADD CONSTRAINT "recurrence_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_order(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: source source_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.source
    ADD CONSTRAINT "source_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: structure_type structure_type_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.structure_type
    ADD CONSTRAINT "structure_type_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: supplier supplier_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task task_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_step task_step_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.task_step
    ADD CONSTRAINT "task_step_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.task(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_category transaction_category_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.transaction_category
    ADD CONSTRAINT "transaction_category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transaction_nature transaction_nature_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.transaction_nature
    ADD CONSTRAINT "transaction_nature_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.transaction_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction_nature transaction_nature_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: upside
--

ALTER TABLE ONLY public.transaction_nature
    ADD CONSTRAINT "transaction_nature_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: upside
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict F5tWe4e9o8BvdekGVaBtlk1b4zhV6a5OwT6GBrP2ftvPAXidbchA197GhajgC0B

