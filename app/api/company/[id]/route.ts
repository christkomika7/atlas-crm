import { checkAccess } from "@/lib/access";
import { createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import { extractCompanyData, getIdFromUrl } from "@/lib/utils";
import { editCompanySchema, EditCompanySchemaType } from "@/lib/zod/company.schema";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const id = getIdFromUrl(req.url, "last") as string;

    await checkAccess(["DASHBOARD"], "READ");

    const company = await prisma.company.findUnique({
        where: { id },
    });

    return NextResponse.json({
        state: "success",
        data: company,
        message: "",
    }, { status: 200 })
}

export async function PUT(req: NextRequest) {
    const id = getIdFromUrl(req.url, "last") as string;
    await checkAccess(["DASHBOARD"], "MODIFY");

    try {
        const formData = await req.formData();
        const companyData = extractCompanyData(formData);

        const data = parseData<EditCompanySchemaType>(editCompanySchema, companyData) as EditCompanySchemaType

        const [company, companies] = await Promise.all([
            prisma.company.findUnique({
                where: { id }
            }),
            prisma.company.findMany({
                where: { id: { not: id } },
                select: { id: true, email: true, companyName: true }
            }),
        ]);

        if (!company) {
            return NextResponse.json(
                {
                    state: "error",
                    message: "Entreprise introuvable.",
                },
                { status: 400 }
            )
        }

        const emailConflict = companies.find(comp => comp.email === data.email);
        if (emailConflict) {
            return NextResponse.json(
                {
                    state: "error",
                    message: "L'adresse mail de l'entreprise est déjà utilisée.",
                },
                { status: 400 }
            )
        }

        const nameConflict = companies.find(comp => comp.companyName === data.companyName);
        if (nameConflict) {
            return NextResponse.json(
                {
                    state: "error",
                    message: "Le nom de l'entreprise est déjà utilisé.",
                },
                { status: 400 }
            )
        }

        const companyHasChangeName = company.companyName.toLowerCase() !== data.companyName.toLowerCase();

        await prisma.company.update({
            where: { id },
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
                niu: data.niu,
                legalForms: data.legalForms,
                bankAccountDetails: data.bankAccountDetails,
                businessActivityType: data.businessActivityType,
                fiscalYearStart: data.fiscal.from,
                fiscalYearEnd: data.fiscal.to,
                vatRates: data.vatRate,
            },
        });


        if (companyHasChangeName) {
            const folder = createFolder([company.companyName]);
            await removePath(folder)
        }

        return NextResponse.json({
            state: "success",
            message: "Entreprise mise à jour avec succès.",
        });

    } catch (error) {
        console.error("Erreur PUT entreprise :", error);
        return NextResponse.json(
            {
                state: "error",
                message: error instanceof Error ? error.message : "Erreur interne du serveur.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY");
    const session = await getSession();

    const id = getIdFromUrl(req.url, "last") as string;

    const company = await prisma.company.findUnique({
        where: { id },
    });

    if (!company) {
        return NextResponse.json({
            message: "Entreprise introuvable.",
            state: "error",
        }, { status: 400 })
    }

    if (session?.user.role !== "ADMIN") {
        return NextResponse.json({
            state: "error",
            message: "Vous n'avez pas les accès nécéssaire pour pouvoir executer cette requête."
        }, { status: 400 })
    }

    await prisma.company.delete({ where: { id: company.id } });
    const folder = createFolder([company.companyName]);
    await removePath(folder);

    return NextResponse.json({
        state: "success",
        message: "Entreprise supprimée avec succès.",
    }, { status: 200 })

}