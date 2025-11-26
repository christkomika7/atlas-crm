import { checkAccess } from "@/lib/access";
import { removePath } from "@/lib/file";
import { extractCompanyData } from "@/lib/utils";
import { companySchema, CompanySchemaType } from "@/lib/zod/company.schema";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { parseData } from "@/lib/parse";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CLIENTS", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    try {
        const { searchParams } = new URL(req.url);

        const skip = parseInt(searchParams.get("skip") || "0", 10);
        const take = parseInt(searchParams.get("take") || DEFAULT_PAGE_SIZE.toString(), 10);

        const total = await prisma.company.count();

        const companies = await prisma.company.findMany({
            skip,
            take,
            orderBy: { createdAt: "desc" },
        });


        return NextResponse.json(
            {
                state: "success",
                data: companies,
                total,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json(
            {
                state: "error",
                message: error instanceof Error ? error.message : "Erreur lors de la récupération des entreprises.",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const result = await checkAccess("SETTING", "CREATE");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    let uploadedPaths: string[] = [];
    let uploadedPassportPaths: string[] = [];
    let uploadedDocumentPaths: string[] = [];

    const formData = await req.formData();
    const companyData = extractCompanyData(formData);
    const data = parseData<CompanySchemaType>(companySchema, {
        ...companyData,
    }) as CompanySchemaType;

    const [companyNameExist, emailExist] = await prisma.$transaction([
        prisma.company.findFirst({
            where: { companyName: data.companyName }
        }),
        prisma.company.findFirst({
            where: { email: data.email }
        }),
    ]);

    if (companyNameExist) {
        return NextResponse.json(
            { state: "error", message: "Une entreprise porte déjà ce nom." },
            { status: 404 }
        );
    }

    if (emailExist) {
        return NextResponse.json(
            { state: "error", message: "Cet adresse mail est déjà utilisé." },
            { status: 404 }
        );
    }


    try {
        const [company, admin] = await prisma.$transaction([
            prisma.company.create({
                data: {
                    companyName: data.companyName,
                    country: data.country,
                    city: data.city,
                    codePostal: data.codePostal ?? "",
                    registeredAddress: data.registeredAddress,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    website: data.website,
                    niu: data.niu,
                    legalForms: data.legalForms,
                    businessRegistrationNumber: data.businessRegistrationNumber,
                    taxIdentificationNumber: data.taxIdentificationNumber,
                    capitalAmount: data.capitalAmount,
                    currency: data.currency,
                    bankAccountDetails: data.bankAccountDetails,
                    businessActivityType: data.businessActivityType,
                    fiscalYearStart: data.fiscal.from,
                    fiscalYearEnd: data.fiscal.to,
                    vatRates: data.vatRate,
                    documentModel: {
                        create: {
                            position: "Center",
                            size: "Medium",
                            primaryColor: "#fbbf24",
                            secondaryColor: "#fef3c7",
                        }
                    }
                },
            }),
            prisma.user.findUnique({
                where: {
                    role: "ADMIN",
                    email: process.env.USER_EMAIL!
                },
                include: { profiles: true }
            })
        ]);

        await prisma.$transaction([
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Règlement loyer",
                    type: "DISBURSEMENT"
                }
            }),
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Règlement salaire",
                    type: "DISBURSEMENT"
                }
            }),
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Règlement prestation de service",
                    type: "DISBURSEMENT"
                }
            }),
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Administration",
                    type: "DISBURSEMENT",
                    natures: {
                        create: { name: "Fiscal", company: { connect: { id: company.id } } }
                    }
                }
            }),
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Règlement fournisseur",
                    type: "DISBURSEMENT"
                }
            }),
            prisma.transactionCategory.create({
                data: {
                    company: { connect: { id: company.id } },
                    name: "Règlement client",
                    type: "RECEIPT"
                }
            }),
        ]);

        if (admin && !admin.currentCompany) {
            await prisma.user.update({
                where: { id: admin.id },
                data: {
                    currentCompany: company.id,
                    currentProfile: admin.profiles[0].id
                }
            })
        }

        return NextResponse.json(
            {
                message: "L'entreprise a été enregistrée avec succès.",
                data: company,
                state: "success",
            },
            { status: 200 }
        );
    } catch (error) {
        console.log({ error })
        await removePath([...uploadedPaths, ...uploadedPassportPaths, ...uploadedDocumentPaths]);
        return NextResponse.json(
            {
                message: "Erreur interne du serveur. Les utilisateurs et fichiers ont été supprimés.",
                state: "error",
            },
            { status: 500 }
        );
    }
}


