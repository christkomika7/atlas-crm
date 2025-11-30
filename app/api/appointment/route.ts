import { sessionAccess, checkAccess } from "@/lib/access";
import { formatDateToDashModel, parseDateTime } from "@/lib/date";
import { sendMail } from "@/lib/email";
import { createFile, createFolder, removePath } from "@/lib/file";
import { $Enums } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";
import { generateId, getFirstValidCompanyId } from "@/lib/utils";
import { appointmentSchema, AppointmentSchemaType } from "@/lib/zod/appointment.schema";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("APPOINTMENT", "CREATE");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }

    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];

    formData.forEach((value, key) => {
        if (key === "uploadDocuments" && value instanceof File) {
            files.push(value);
        } else {
            rawData[key] = value as string;
        }
    });

    const [hour, minute]: number[] = rawData.time.split(":");
    const date = parseDateTime(rawData.date as string, hour, minute);
    const notify = JSON.parse(rawData.notify);

    const data = parseData<AppointmentSchemaType>(appointmentSchema, {
        ...rawData,
        date: date,
        notify: notify,
        uploadDocuments: files,
    }) as AppointmentSchemaType;

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

    const key = generateId();
    const folder = createFolder([companyExist.companyName, "appointment", `${clientExist.firstname}_${clientExist.lastname}_----${key}`]);
    let savedPaths: string[] = [];


    try {
        for (const file of files) {
            const upload = await createFile(file, folder);
            savedPaths = [...savedPaths, upload]
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return NextResponse.json({
                status: "error",
                message: "Aucun élément trouvé pour cet identifiant.",
            }, { status: 404 });

        }

        const createdAppointment = await prisma.appointment.create({
            data: {
                email: data.email,
                date: data.date,
                time: data.time,
                path: folder,
                notify: data.notify,
                address: data.address,
                subject: data.subject,
                documents: savedPaths,
                teamMemberName: user.name,
                teamMember: {
                    connect: { id: user.currentProfile as string }
                },
                client: {
                    connect: {
                        id: data.client
                    }
                },
                company: {
                    connect: {
                        id: data.company
                    }
                },

            },
            include: {
                teamMember: true
            }
        });


        if (data.notify) {
            const mailOptions = {
                from: {
                    name: companyExist.companyName || "Votre Entreprise",
                    address: process.env.EMAIL_USER as string
                },
                to: data.email,
                subject: data.subject,
                html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <p>
                    Bonjour,<br />
                    Nous vous rappelons que votre rendez-vous est fixé le 
                    <strong>${formatDateToDashModel(data.date)}</strong> à <strong>${data.time}</strong>.<br />
                    Celui-ci se tiendra à l’adresse suivante : <strong>${data.address}</strong><br />
                    Vous serez reçu par 
                    <strong>${createdAppointment.teamMember?.firstname} ${createdAppointment.teamMember?.lastname}</strong>.<br />
                    Merci de vous présenter quelques minutes à l’avance. Pour toute modification ou annulation,
                    nous vous invitons à nous contacter au plus tard 24 heures avant l’heure prévue.<br /><br />

                    Cordialement,<br />
                    L’équipe <strong>${companyExist.companyName}</strong>
                </p>
                </div>
                `
            }
            await sendMail(mailOptions);
        }

        return NextResponse.json({
            status: "success",
            message: "Rendez-vous ajouté avec succès.",
            data: createdAppointment,
        });

    } catch (error) {
        await removePath(savedPaths)
        console.error({ error })

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de l'ajout du rendez-vous.",
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("APPOINTMENT", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const appointments = await prisma.appointment.findMany({
        where: { id: { in: ids } },
        include: {
            company: true
        }
    });

    const companyId = getFirstValidCompanyId(appointments);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    await checkAccessDeletion($Enums.DeletionType.APPOINTMENTS, ids, companyId)


    await prisma.appointment.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    appointments.map(async appointment => {
        await removePath(appointment.documents)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les rendez-vous sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}