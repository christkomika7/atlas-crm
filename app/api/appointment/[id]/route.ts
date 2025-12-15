import { checkAccess, sessionAccess } from "@/lib/access";
import { checkData } from "@/lib/database";
import { getCurrentDateTime, parseDateTime } from "@/lib/date";
import { createFolder, removePath, updateFiles } from "@/lib/file";
import { $Enums, Prisma } from "@/lib/generated/prisma";
import { parseData } from "@/lib/parse";
import { getIdFromUrl } from "@/lib/utils";
import { editAppointmentSchema, EditAppointmentSchemaType } from "@/lib/zod/appointment.schema";
import { AppointmentType } from "@/types/appointment.type";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAccessDeletion } from "@/lib/server";

export async function GET(req: NextRequest) {
    try {
        const result = await checkAccess("APPOINTMENT", "READ");

        if (!result.authorized) {
            return Response.json({
                status: "error",
                message: result.message,
                data: []
            }, { status: 200 });
        }

        const url = new URL(req.url);
        const id = getIdFromUrl(req.url, "last") as string;

        const skip = url.searchParams.has("skip") ? Number(url.searchParams.get("skip")) : undefined;
        const take = url.searchParams.has("take") ? Number(url.searchParams.get("take")) : undefined;

        const type = (url.searchParams.get("type") as "upcoming" | "past") ?? undefined;

        const sortKeys = [
            "byDate",
            "byClient",
            "byEmail",
            "byTime",
            "byAddress",
            "byCompany"
        ] as const;

        let orderBy: any = { date: "desc" };

        for (const key of sortKeys) {
            const val = url.searchParams.get(key);
            if (val) {
                const order = String(val).toLowerCase() === "desc" ? "desc" : "asc";
                switch (key) {
                    case "byDate":
                        orderBy = { date: order };
                        break;
                    case "byClient":
                        orderBy = [{ client: { lastname: order } }, { client: { firstname: order } }];
                        break;
                    case "byCompany":
                        orderBy = [{ client: { companyName: order } }];
                        break;
                    case "byEmail":
                        orderBy = { email: order };
                        break;
                    case "byTime":
                        orderBy = { time: order };
                        break;
                    case "byAddress":
                        orderBy = { address: order };
                        break;
                    default:
                        orderBy = { date: order };
                }
                break;
            }
        }

        const now = getCurrentDateTime();
        const where: any = { companyId: id };

        if (type === "upcoming") {
            where.date = { gte: now };
        } else if (type === "past") {
            where.date = { lt: now };
        }

        const total = await prisma.appointment.count({ where });

        const appointments = await prisma.appointment.findMany({
            where,
            include: { client: true },
            orderBy,
            ...(skip !== undefined ? { skip } : {}),
            ...(take !== undefined ? { take } : {}),
        });

        return NextResponse.json({ state: "success", data: appointments, total }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/appointment/[id] error:", err);
        return NextResponse.json({ state: "error", message: err?.message || "Erreur serveur" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const result = await checkAccess("APPOINTMENT", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    try {
        const id = getIdFromUrl(req.url, "last") as string;
        const body = await req.json();
        const data: "upcoming" | "past" = body?.data;

        const now = getCurrentDateTime();

        const filter: any = {};

        if (data === "upcoming") {
            Object.assign(filter, {
                date: { gte: now },
            });
        } else if (data === "past") {
            Object.assign(filter, {
                date: { lt: now },
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

        const total = await prisma.appointment.count({
            where: {
                companyId: id,
                ...filter,
            },
        });

        return NextResponse.json(
            {
                state: "success",
                data: appointments,
                total,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("POST /api/appointment/[id] error:", err);
        return NextResponse.json({ state: "error", message: err?.message || "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const result = await checkAccess("APPOINTMENT", "MODIFY");

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



    const id = getIdFromUrl(req.url, "last") as string;

    await checkData(prisma.appointment, { where: { id }, include: { company: true } }, "identifiant") as AppointmentType;

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
        notify: false
    }) as EditAppointmentSchemaType;

    const [companyExist, clientExist, appointmentExist] = await prisma.$transaction([
        prisma.company.findUnique({ where: { id: data.company } }),
        prisma.client.findUnique({ where: { id: data.client } }),
        prisma.appointment.findUnique({ where: { id: data.id } })
    ]);

    if (!companyExist || !clientExist || !appointmentExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const folder = createFolder([companyExist.companyName, "appointment", `${clientExist.firstname}_${clientExist.lastname}_----${appointmentExist?.path.split("_----")[1]}`]);
    let savedDocuments: string[] = await updateFiles({ folder: folder, outdatedData: { id: appointmentExist.id, path: appointmentExist.path || "", files: appointmentExist.documents }, updatedData: { id: data.id, lastUploadDocuments: data.lastUploadDocuments }, files: data.uploadDocuments ?? [] });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });

    }

    const updateData: Prisma.AppointmentUpdateInput = {
        email: data.email,
        date: data.date,
        time: data.time,
        path: folder,
        address: data.address,
        subject: data.subject,
        documents: savedDocuments,
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
                        id: user.currentProfile as string
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
        await removePath(savedDocuments);
        console.error({ error });

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du rendez-vous.",
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
    const id = getIdFromUrl(req.url, "last") as string;

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { company: true }
    });

    if (!appointment) {
        return NextResponse.json({
            message: "Rendez-vous introuvable.",
            state: "error",
        }, { status: 400 })
    }

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.PRODUCT_SERVICES, [id], appointment.company.id);

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

    await prisma.appointment.delete({ where: { id } });
    await removePath(appointment.documents);
    return NextResponse.json({
        state: "success",
        message: "Rendez-vous supprimé avec succès.",
    }, { status: 200 }
    )
}