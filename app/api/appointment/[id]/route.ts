import { checkAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { getCurrentDateTime, parseDateTime } from "@/lib/date";
import { createFolder, moveTo, removePath, saveFile } from "@/lib/file";
import { Prisma, User } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import { getIdFromUrl } from "@/lib/utils";
import { editAppointmentSchema, EditAppointmentSchemaType } from "@/lib/zod/appointment.schema";
import { AppointmentType } from "@/types/appointment.type";
import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    await checkAccess(["APPOINTMENT"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;
    const { data }: { data: "upcoming" | "past" } = await req.json();

    const now = getCurrentDateTime(); // Doit renvoyer un Date correct (local)

    const filter: any = {};

    if (data === "upcoming") {
        Object.assign(filter, {
            date: {
                gte: now,
            },
        });
    } else if (data === "past") {
        Object.assign(filter, {
            date: {
                lt: now,
            },
        });
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            companyId: id,
            ...filter,
        },
        include: {
            client: true,
        },
        orderBy: {
            date: "asc",
        },
    });

    return NextResponse.json(
        {
            state: "success",
            data: appointments,
        },
        { status: 200 }
    );
}

export async function PUT(req: NextRequest) {
    const user = await checkAccess(["APPOINTMENT"], "MODIFY") as User;

    const id = getIdFromUrl(req.url, "last") as string;

    const appointment = await checkData(prisma.appointment, { where: { id }, include: { company: true } }, "identifiant") as AppointmentType;

    const formData = await req.formData();
    const rawData: Record<string, string> = {};
    const files: File[] = [];

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value);
        } else {
            rawData[key] = value as string;
        }
    });

    const [hour, minute]: string[] = rawData.time.split(":");
    const date = parseDateTime(rawData.date as string, Number(hour), Number(minute));

    const data = parseData<EditAppointmentSchemaType>(editAppointmentSchema, {
        ...rawData as unknown as EditAppointmentSchemaType,
        date: date,
        lastUploadDocuments: rawData.lastUploadDocuments.split(";"),
        uploadDocuments: files,
    }) as EditAppointmentSchemaType;

    const [companyExist, clientExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.company } }),
        prisma.client.findUnique({ where: { id: data.client } })
    ]);

    if (!companyExist || !clientExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const previousDocs = appointment.documents ?? [];

    const key = appointment.path.split("_----")[1];
    const folder = createFolder([companyExist.companyName, "appointment", `${clientExist.firstname}_${clientExist.lastname}_----${key}`]);

    // Suppression des fichiers supprimés par l'utilisateur
    const deletedDocs = previousDocs.filter(doc => !data.lastUploadDocuments?.includes(doc));
    const updatedDocs = previousDocs.filter(doc => data.lastUploadDocuments?.includes(doc))
    await removePath(deletedDocs);

    if ((data.id === appointment.id) && (appointment.path !== folder)) {
        await moveTo(appointment.path, folder)
    }


    let savedPaths: string[] = [];

    // Mise a jour des anciens fichiers
    savedPaths = [...updatedDocs.map(doc => {
        const filename = doc.split("_----")[1];
        return createFolder([companyExist.companyName, "appointment", `${clientExist.firstname}_${clientExist.lastname}`, "_----", filename])
    })]

    // Sauvegarde des nouveaux fichiers
    for (const file of files) {
        const filePath = await saveFile(file, folder);
        savedPaths.push(filePath);
    }

    // 🛠 Construction dynamique de l’objet de mise à jour
    const updateData: Prisma.AppointmentUpdateInput = {
        email: data.email,
        date: data.date,
        time: data.time,
        path: folder,
        address: data.address,
        subject: data.subject,
        documents: [...savedPaths, ...(data.lastUploadDocuments ?? [])],
    };

    try {
        const updatedAppointment = await prisma.appointment.update({
            where: { id: data.id },
            data: {
                ...updateData,
                company: {
                    connect: {
                        id: data.company
                    }
                },
                client: {
                    connect: {
                        id: data.client
                    }
                },
                teamMember: {
                    connect: {
                        id: user.id
                    }
                }
            },
        });

        return NextResponse.json({
            status: "success",
            message: "Le rendez-vous modifié avec succès.",
            data: updatedAppointment,
        });
    } catch (error) {
        await removePath(savedPaths);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du rendez-vous.",
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    await checkAccess(["APPOINTMENT"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const appointment = await prisma.appointment.findUnique({
        where: { id },
    });

    if (!appointment) {
        return NextResponse.json({
            message: "Rendez-vous introuvable.",
            state: "error",
        }, { status: 400 })
    }

    await prisma.appointment.delete({ where: { id } });
    await removePath(appointment.documents);
    return NextResponse.json({
        state: "success",
        message: "Rendez-vous supprimé avec succès.",
    }, { status: 200 }
    )
}