import { checkAccess } from "@/lib/access";
import { createEmployee, updateEmployee } from "@/lib/database";
import { createFolder, removePath } from "@/lib/file";
import { parseData } from "@/lib/parse";
import { extractCompanyData, getIdFromUrl } from "@/lib/utils";
import { editCompanySchema, EditCompanySchemaType } from "@/lib/zod/company.schema";
import { NextResponse, type NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const id = getIdFromUrl(req.url, "last") as string;

    await checkAccess(["DASHBOARD"], "READ");

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            employees: {
                include: {
                    profile: true,
                    permissions: true
                }
            }
        },
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

        // Récupération des données initiales
        const [company, companies, users] = await Promise.all([
            prisma.company.findUnique({
                where: { id },
                include: {
                    employees: {
                        include: { profile: true },
                    },
                },
            }),
            prisma.company.findMany({
                where: { id: { not: id } },
                select: { id: true, email: true, companyName: true }
            }),
            prisma.user.findMany({
                select: { id: true, email: true }
            })
        ]);

        if (!company) {
            throw new Error("Entreprise introuvable.");
        }

        // Vérifications des doublons
        const emailConflict = companies.find(comp => comp.email === data.email);
        if (emailConflict) {
            throw new Error("L'adresse mail de l'entreprise est déjà utilisée.");
        }

        const nameConflict = companies.find(comp => comp.companyName === data.companyName);
        if (nameConflict) {
            throw new Error("Le nom de l'entreprise est déjà utilisé.");
        }

        // Paths
        const uploadedPaths: string[] = [];
        const uploadedPassportPaths: string[] = [];
        const uploadedDocumentPaths: string[] = [];


        // Préparer les données pour optimiser les opérations
        const existingUsers = company.employees;
        const companyHasChangeName = company.companyName.toLowerCase() !== data.companyName.toLowerCase();
        const oldUsersMap = new Map<string, typeof existingUsers[0]>();
        for (const user of existingUsers) {
            oldUsersMap.set(user.id, user);
        }
        const currentUsers = data.employees.map(employee => employee.id).filter(id => id !== undefined);
        const existingUsersIds = existingUsers.map(user => user.id);

        const usersToRemove = existingUsers.filter(user => !currentUsers.includes(user.id));
        const usersToAdd = data.employees.filter(user => user.id === undefined);
        const usersToUpdate = data.employees.filter(user =>
            user.id !== undefined && existingUsersIds.includes(user.id ?? "")
        );


        // Vérification des emails des employés
        for (const user of data.employees) {
            const emailConflict = users.find(u => u.id !== user.id && u.email === user.email);
            if (emailConflict) {
                throw new Error(`L'email ${user.email} est déjà utilisé.`);
            }
        }

        // OPTIMISATION: Traiter les suppressions d'abord (plus rapide)
        for (const user of usersToRemove) {
            const deletedUser = await prisma.user.delete({ where: { id: user.id }, include: { profile: true } });
            await removePath([deletedUser.image, deletedUser.profile?.passport, deletedUser.profile?.internalRegulations]);
        }

        // Traiter les ajouts d'utilisateurs
        const newUsersIds: string[] = [];
        for (const user of usersToAdd) {
            await createEmployee(user, data.companyName, newUsersIds, uploadedPaths, uploadedPassportPaths, uploadedDocumentPaths)
        }

        // Traiter les mises à jour d'utilisateurs
        for (const user of usersToUpdate) {
            const oldUser = oldUsersMap.get(user.id!);
            if (!oldUser) {
                console.warn(`Ancien utilisateur non trouvé pour l'id: ${user.id}`);
                continue;
            }
            // Suppression des anciens fichiers
            await removePath([oldUser.image, oldUser.profile?.passport, oldUser.profile?.internalRegulations])
            await updateEmployee(user, data.companyName, oldUser.path ?? "", [], uploadedPaths, uploadedPassportPaths, uploadedDocumentPaths)
        }

        // Mise à jour de l'entreprise
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
                bankAccountDetails: data.bankAccountDetails,
                businessActivityType: data.businessActivityType,
                fiscalYearStart: data.fiscal.from,
                fiscalYearEnd: data.fiscal.to,
                vatRates: data.vatRate,
                employees: {
                    connect: newUsersIds.map((id) => ({ id })),
                }
            },
        });


        console.log({ companyHasChangeName })
        if (companyHasChangeName) {
            const folder = createFolder([company.companyName]);
            console.log({ OLD_FOLDER: folder })
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

    const id = getIdFromUrl(req.url, "last") as string;

    const company = await prisma.company.findUnique({
        where: { id },
    });

    console.log({ company })

    if (!company) {
        return NextResponse.json({
            message: "Entreprise introuvable.",
            state: "error",
        }, { status: 400 })
    }

    await prisma.company.delete({ where: { id: company.id } });
    const folder = createFolder([company.companyName]);
    await removePath(folder);

    return NextResponse.json({
        state: "success",
        message: "Employé supprimé avec succès.",
    }, { status: 200 })

}