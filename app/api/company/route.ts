import { checkAccess } from "@/lib/access";
import { checkIfExists, createEmployee, initializeCurrentCompany } from "@/lib/database";
import { removePath } from "@/lib/file";
import { extractCompanyData } from "@/lib/utils";
import { companySchema, CompanySchemaType } from "@/lib/zod/company.schema";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { parseData } from "@/lib/parse";
import { Company } from "@/lib/generated/prisma";


export async function GET() {
    await checkAccess(["DASHBOARD"], "READ");

    const companies = await prisma.company.findMany();
    return NextResponse.json({
        state: "success",
        data: companies,
    }, { status: 200 })
}

export async function POST(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "CREATE");

    let uploadedPaths: string[] = [];
    let uploadedPassportPaths: string[] = [];
    let uploadedDocumentPaths: string[] = [];
    let createdUserIds: string[] = [];

    try {
        const formData = await req.formData();
        const companyData = extractCompanyData(formData);
        const data = parseData<CompanySchemaType>(companySchema, {
            ...companyData,
        }) as CompanySchemaType

        await checkIfExists(prisma.company, { where: { companyName: data.companyName } }, "entreprise", data.companyName);
        await checkIfExists(prisma.company, { where: { email: data.email } }, "entreprise", data.email);

        const employeesWithAuth = await Promise.all(
            data.employees.map(async (employee) => {
                return await createEmployee(employee, data.companyName, createdUserIds, uploadedPaths, uploadedPassportPaths, uploadedDocumentPaths);
            })
        );

        let company: Company | null = null
        try {
            company = await prisma.company.create({
                data: {
                    companyName: data.companyName,
                    country: data.country,
                    city: data.city,
                    codePostal: data.codePostal ?? "",
                    registeredAddress: data.registeredAddress,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    website: data.website,
                    businessRegistrationNumber: data.businessRegistrationNumber,
                    taxIdentificationNumber: data.taxIdentificationNumber,
                    capitalAmount: data.capitalAmount,
                    currency: data.currency,
                    bankAccountDetails: data.bankAccountDetails,
                    businessActivityType: data.businessActivityType,
                    fiscalYearStart: data.fiscal.from,
                    fiscalYearEnd: data.fiscal.to,
                    vatRates: data.vatRate,
                    employees: {
                        connect: employeesWithAuth.map((id) => ({ id })),
                    },
                },
            });
            if (company) {
                await initializeCurrentCompany(company.id, createdUserIds)
                await prisma.documentModel.create({
                    data: {
                        position: "Center",
                        size: "Medium",
                        primaryColor: "#fbbf24",
                        secondaryColor: "#fef3c7",
                        company: {
                            connect: {
                                id: company.id
                            }
                        }
                    }
                })
            }

        } catch (err) {
            await prisma.user.deleteMany({ where: { id: { in: createdUserIds.filter(v => Boolean(v)) } } });
            if (company && company.id) {
                await prisma.company.delete({ where: { id: company.id } })

            }
            await removePath([...uploadedPaths, ...uploadedPassportPaths, ...uploadedDocumentPaths]);

            console.warn(err)
            return NextResponse.json(
                {
                    message: "Erreur lors de la création de l'entreprise. Les utilisateurs ont été supprimés.",
                    state: "error",
                },
                { status: 500 }
            );
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
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds.filter(v => Boolean(v)) } } });
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


