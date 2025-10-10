import { Prisma, Role, User as PrismaUser } from "@/lib/generated/prisma"; // adapte ce chemin si besoin
import { auth } from "./auth";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { UserEditSchemaType } from "./zod/user.schema";
import { createFile, createFolder, moveTo, removePath } from "./file";
import prisma from "./prisma";
import { createPermissionsData } from "./utils";
import { Decimal } from "decimal.js";

type User = {
    name: string;
    email: string;
    password: string;
    role: Role
};

export async function createUser(data: User) {

    try {
        const { user } = await auth.api.signUpEmail({
            body: {
                name: data.name,
                role: data.role,
                email: data.email,
                password: data.password,
                emailVerified: true,
            },
        });

        return user
    } catch (error: unknown) {
        if (error instanceof APIError) {
            return NextResponse.json({
                status: "fail",
                message: error.body?.message ?? error.message,
            }, { status: error.statusCode ?? 400 });
        }
        console.error("Erreur inattendue lors de createUser:", error);
        return NextResponse.json({
            status: "error",
            message: "Une erreur inattendue est survenue.",
        }, { status: 500 });
    }
}


export async function checkIfExists<
    Delegate extends { findFirst(args: any): Promise<any> },
    Args extends Parameters<Delegate["findFirst"]>[0] & { where: unknown }
>(
    model: Delegate,
    args: Prisma.SelectSubset<Args, Args>,
    entityName: string,
    value: string,
    deletePath?: string[]
) {
    const existing = await model.findFirst(args);

    if (existing) {
        if (deletePath && deletePath.length > 0) {
            await removePath(deletePath)
        }
        return NextResponse.json(
            {
                message: `Un(e) ${entityName} portant ${value} existe déjà.`,
                state: "error"
            },
            { status: 409 }
        );
    }

    return null;
}

export async function checkData<
    Delegate extends { findUnique(args: any): Promise<any> },
    Args extends Parameters<Delegate["findUnique"]>[0] & { where: unknown }
>(
    model: Delegate,
    args: Prisma.SelectSubset<Args, Args>,
    entityName: string
): Promise<any | NextResponse> {
    const item = await model.findUnique(args);

    if (!item) {
        console.warn(`[NOT FOUND] ${entityName} introuvable avec :`, args.where);

        return NextResponse.json(
            {
                status: "error",
                message: `Aucun ${entityName} trouvé pour ces critères.`,
            },
            { status: 404 }
        );
    }

    return item;
}


export async function createEmployee(employee: UserEditSchemaType, companyName: string, createdUserIds: string[], uploadedPaths: string[], uploadedPassportPaths: string[], uploadedDocumentPaths: string[]): Promise<string> {
    let imagePath = "";
    let passportPath = "";
    let documentPath = "";


    console.log({ employee })

    // Crée le dossier upload basé sur companyName et user
    const folder = createFolder([companyName, "user", `${employee.firstname}_${employee.lastname}`]);

    try {
        // Uploads des fichiers
        imagePath = await createFile(employee.image, folder, "profile");
        passportPath = await createFile(employee.passport, folder, "passport");
        documentPath = await createFile(employee.document, folder, "reglement_interieur");

        uploadedPaths.push(imagePath);
        uploadedPassportPaths.push(passportPath);
        uploadedDocumentPaths.push(documentPath);


        // Création utilisateur via ton système d’auth
        const user = await createUser({
            name: `${employee.firstname} ${employee.lastname}`,
            role: Role.USER,
            email: employee.email,
            password: employee.password ?? "",
        }) as PrismaUser;

        createdUserIds.push(user.id);

        // Mise à jour Prisma avec profile, permissions et paths fichiers
        await prisma.user.update({
            where: { id: user.id },
            data: {
                image: imagePath,
                path: folder,
                profile: {
                    create: {
                        lastname: employee.lastname,
                        firstname: employee.firstname,
                        phone: employee.phone,
                        job: employee.job,
                        salary: employee.salary,
                        passport: passportPath,
                        internalRegulations: documentPath,
                    },
                },
                permissions: {
                    deleteMany: {},
                    createMany: {
                        data: createPermissionsData(employee),
                    },
                },
            },
        });

        return user.id;
    } catch (err) {
        await removePath([imagePath, passportPath, documentPath])
        throw err;
    }
}


export async function updateEmployee(employee: UserEditSchemaType, companyName: string, oldPath: string, createdUserIds: string[], uploadedPaths: string[], uploadedPassportPaths: string[], uploadedDocumentPaths: string[]): Promise<string> {
    let imagePath = "";
    let passportPath = "";
    let documentPath = "";

    const hash = employee.password ? await (await auth.$context).password.hash(employee.password) : null;

    const folder = createFolder([companyName, "user", `${employee.firstname}_${employee.lastname}`]);

    if (oldPath !== folder) {
        console.log({ MOVE_TO: oldPath !== folder, FROM: oldPath, TO: folder })
        moveTo(oldPath, folder)
    }

    try {
        // Uploads des fichiers
        imagePath = await createFile(employee.image, folder, "profile");
        passportPath = await createFile(employee.passport, folder, "passport");
        documentPath = await createFile(employee.document, folder, "reglement_interieur");

        uploadedPaths.push(imagePath);
        uploadedPassportPaths.push(passportPath);
        uploadedDocumentPaths.push(documentPath);

        const updatedUser = await prisma.user.update({
            where: { id: employee.id },
            data: {
                name: `${employee.firstname} ${employee.lastname}`,
                email: employee.email,
                image: imagePath,
                path: folder,
                profile: {
                    update: {
                        lastname: employee.lastname,
                        firstname: employee.firstname,
                        phone: employee.phone,
                        job: employee.job,
                        salary: employee.salary,
                        passport: passportPath,
                        internalRegulations: documentPath
                    },
                },
                permissions: {
                    deleteMany: {},
                    createMany: {
                        data: createPermissionsData(employee),
                    },
                },
                ...(hash && {
                    account: {
                        updateMany: {
                            where: { userId: employee.id },
                            data: { password: hash },
                        },
                    },
                }),
            },
        });

        createdUserIds.push(updatedUser.id);
        return updatedUser.id;
    } catch (err) {
        // Nettoyage en cas d’erreur
        await removePath([imagePath, passportPath, documentPath])
        throw err;
    }
}


export async function initializeCurrentCompany(currentCompany: string, createdUserIds: string[]) {
    // Mise à jour des users créés sans currentCompany
    await prisma.user.updateMany({
        where: {
            id: { in: createdUserIds },
            currentCompany: null,
        },
        data: {
            currentCompany,
        },
    });

    // Mise à jour de l'admin spécifique si currentCompany est null
    await prisma.user.updateMany({
        where: {
            email: "ralph.pinto@atlasmediaafrica.com",
            role: "ADMIN",
            currentCompany: null,
        },
        data: {
            currentCompany,
        },
    });
}

