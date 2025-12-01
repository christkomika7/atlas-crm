import { NextResponse, type NextRequest } from "next/server";
import { createPermissionsData, generateId, getIdFromUrl } from "@/lib/utils";
import { checkAccess, sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { userEditSchema, UserEditSchemaType, userSchema, UserSchemaType } from "@/lib/zod/user.schema";
import { parseData } from "@/lib/parse";
import { createFile, createFolder, removePath } from "@/lib/file";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }
    const companyId = getIdFromUrl(req.url, "last") as string;

    const profiles = await prisma.profile.findMany({
        where: {
            companyId
        }, include: {
            user: true,
            permissions: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: profiles,
        message: "",
    }, { status: 200 })
}


export async function POST(req: NextRequest) {
    await checkAccess(["SETTING"], "CREATE");
    const companyId = getIdFromUrl(req.url, "last") as string;

    const formData = await req.formData();
    const rawData: any = {};
    let image: File | null = null;

    formData.forEach((value, key) => {
        if (key === "image" && value instanceof File) {
            image = value;
        } else {
            rawData[key] = value as string;
        }
    });


    const data = parseData<UserSchemaType>(userSchema, {
        ...rawData,
        appointment: JSON.parse(rawData.appointment),
        billboards: JSON.parse(rawData.billboards),
        clients: JSON.parse(rawData.clients),
        contract: JSON.parse(rawData.contract),
        creditNotes: JSON.parse(rawData.creditNotes),
        dashboard: JSON.parse(rawData.dashboard),
        deliveryNotes: JSON.parse(rawData.deliveryNotes),
        invoices: JSON.parse(rawData.invoices),
        productServices: JSON.parse(rawData.productServices),
        projects: JSON.parse(rawData.projects),
        purchaseOrder: JSON.parse(rawData.purchaseOrder),
        quotes: JSON.parse(rawData.quotes),
        setting: JSON.parse(rawData.setting),
        suppliers: JSON.parse(rawData.suppliers),
        transaction: JSON.parse(rawData.transaction),

    }) as UserSchemaType;

    const createUserFolder = () =>
        createFolder([`${generateId()}_${data.firstname}_${data.lastname}`]);

    const saveImageIfAny = async (folder: string) => {
        return image ? await createFile(image, folder) : "";
    };

    const createProfileWithPermissions = async (userId: string, folder: string, savedImage: string) => {
        return prisma.profile.create({
            data: {
                role: "USER",
                firstname: data.firstname,
                lastname: data.lastname,
                path: folder,
                image: savedImage,
                phone: data.phone,
                job: data.job,
                salary: data.salary,
                permissions: {
                    createMany: {
                        data: createPermissionsData(data),
                    },
                },
                user: { connect: { id: userId } },
                company: { connect: { id: companyId } },
            },
        });
    };

    if (data.userId) {
        try {
            const alreadyLinked = await prisma.profile.findFirst({
                where: {
                    companyId,
                    userId: data.userId,
                },
            });

            if (alreadyLinked) {
                return NextResponse.json(
                    {
                        state: "error",
                        message: "Cet adresse mail est déjà pris",
                    },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: data.userId },
                include: { profiles: true },
            });

            if (!user) {
                return NextResponse.json(
                    {
                        state: "error",
                        message: "Aucun utilisateur trouvé.",
                    },
                    { status: 400 }
                );
            }

            const folder = createUserFolder();
            const savedImage = await saveImageIfAny(folder);

            const profile = await createProfileWithPermissions(user.id, folder, savedImage);

            if (!user.currentCompany || !user.currentProfile) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        currentCompany: user.currentCompany ?? companyId,
                        currentProfile: user.currentProfile ?? profile.id,
                    },
                });
            }

            const collaborator = await prisma.user.findUnique({
                where: { id: user.id },
            });

            return NextResponse.json(
                {
                    message: "Collaborateur ajouté avec succès.",
                    data: collaborator,
                    state: "success",
                },
                { status: 200 }
            );
        } catch (e) {
            return NextResponse.json(
                {
                    message: "Une erreur est survenue lors de la création du collaborateur.",
                    state: "error",
                },
                { status: 500 }
            );
        }
    }
}

export async function PUT(req: NextRequest) {
    await checkAccess(["SETTING"], "CREATE");
    const profileId = getIdFromUrl(req.url, "last") as string;

    const formData = await req.formData();
    const rawData: any = {};
    let image: File | string = "";

    formData.forEach((value, key) => {
        if (key === "image") {
            image = value;
        } else {
            rawData[key] = value as string;
        }
    });


    const data = parseData<UserEditSchemaType>(userEditSchema, {
        ...rawData,
        appointment: JSON.parse(rawData.appointment),
        billboards: JSON.parse(rawData.billboards),
        clients: JSON.parse(rawData.clients),
        contract: JSON.parse(rawData.contract),
        creditNotes: JSON.parse(rawData.creditNotes),
        dashboard: JSON.parse(rawData.dashboard),
        deliveryNotes: JSON.parse(rawData.deliveryNotes),
        invoices: JSON.parse(rawData.invoices),
        productServices: JSON.parse(rawData.productServices),
        projects: JSON.parse(rawData.projects),
        purchaseOrder: JSON.parse(rawData.purchaseOrder),
        quotes: JSON.parse(rawData.quotes),
        setting: JSON.parse(rawData.setting),
        suppliers: JSON.parse(rawData.suppliers),
        transaction: JSON.parse(rawData.transaction),
        image: null,
    }) as UserEditSchemaType;


    const profileExist = await prisma.profile.findUnique({
        where: { id: profileId }
    });

    if (!profileExist) {
        return NextResponse.json({
            state: "error",
            message: "Aucun utilisateur trouvé.",
        }, {
            status: 400
        })
    }

    const userEmailExist = await prisma.user.findFirst({
        where: {
            id: { not: profileExist.userId },
            email: data.email,
        }
    });

    if (userEmailExist) {
        return NextResponse.json({
            state: "error",
            message: "Cet adresse mail est déjà pris",
        }, {
            status: 400
        })
    }
    let savedImage: string | null = null;

    try {
        if (data.password && data.newPassword) {
            try {
                const rawHeaders = await headers();
                const headerObject: Record<string, string> = {};

                rawHeaders.forEach((value, key) => {
                    headerObject[key] = value;
                });

                await auth.api.changePassword({
                    body: {
                        newPassword: data.newPassword,
                        currentPassword: data.password,
                        revokeOtherSessions: false,
                    },
                    headers: headerObject,
                });

            } catch (error: any) {
                const message =
                    error?.code === "INVALID_PASSWORD"
                        ? "Mot de passe actuel incorrect."
                        : "Impossible de modifier le mot de passe.";

                return NextResponse.json({
                    state: "error",
                    message
                }, { status: 400 });
            }
        }

        if (typeof image === "string" && image === "null") {
            await removePath(profileExist.image);
            savedImage = null
        }

        if (typeof image === "string" && image === "undefined") {
            savedImage = profileExist.image;
        }

        if (typeof image !== "string" && image as unknown as File instanceof File) {
            await removePath(profileExist.image);
            savedImage = await createFile(image as unknown as File, profileExist.path);
        }

        await prisma.permission.deleteMany({
            where: { profileId }
        });

        const collaborator = await prisma.profile.update({
            where: { id: profileId },
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                image: savedImage,
                phone: data.phone,
                job: data.job,
                salary: data.salary,
                permissions: {
                    createMany: {
                        data: createPermissionsData(data)
                    }
                },
                user: {
                    update: {
                        data: {
                            name: `${data.firstname} ${data.lastname}`,
                            email: data.email
                        }
                    }
                }
            }
        });
        return NextResponse.json({
            message: "Collaborateur modifié avec succès.",
            data: collaborator,
            state: "success",

        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: "Une erreur est survenue lors de la modification du collaborateur.",
            state: "error",
        }, {
            status: 500
        })
    }

}

export async function DELETE(req: NextRequest) {
    await checkAccess(["SETTING"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const profile = await prisma.profile.findUnique({
        where: { id },
        include: {
            user: true,
            appointments: true,
            projects: true,
            tasks: true,
            dibursements: true
        }
    });


    if (!profile) {
        return NextResponse.json({
            message: "Collaborateur introuvable.",
            state: "error",
        }, { status: 400 })
    }

    const appointments = profile.appointments.length;
    const projects = profile.projects.length;
    const tasks = profile.tasks.length;
    const dibursements = profile.dibursements.length;

    if (appointments > 0 || projects > 0 || tasks > 0 || dibursements > 0) {
        return NextResponse.json({
            status: "error",
            message: "Certaines données ( rendez-vous, projet, tâche, décaissement.) sont encore reliée à ce collaborateur.",
        }, { status: 400 });
    }

    const image = profile.image;
    const passport = profile.passport;
    const internalRegulations = profile.internalRegulations;
    await removePath([image, passport, internalRegulations]);

    await prisma.profile.delete({ where: { id } });

    const user = await prisma.user.findUnique({
        where: { id: profile.user.id },
        include: { profiles: true }
    })

    if (user?.profiles.length === 0) {
        await prisma.user.delete({ where: { id: user.id } });
    }

    return NextResponse.json({
        state: "success",
        message: "Employé supprimé avec succès.",
    }, { status: 200 })
}