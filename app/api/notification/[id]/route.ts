import { checkAccess, sessionAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const companyId = getIdFromUrl(req.url, 2) as string;

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Aucune notification trouvée.",
        }, { status: 404 });
    }

    const MAX_TAKE = 200;
    const DEFAULT_TAKE = 50;

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

    let take = DEFAULT_TAKE;
    if (rawTake) {
        const parsed = parseInt(rawTake, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
            take = Math.min(parsed, MAX_TAKE);
        }
    }

    try {
        const [total, notifications] = await prisma.$transaction([
            prisma.notification.count({ where: { companyId } }),
            prisma.notification.findMany({
                where: { companyId },
                include: {
                    dibursement: true,
                    receipt: true,
                    paymentDibursement: true,
                    invoice: true,
                    quote: true,
                    deliveryNote: true,
                    purchaseOrder: true,
                    appointment: true,
                    readBy: { include: { user: true } },
                    task: true,
                    company: { include: { documentModel: true } }
                },
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ]);

        return NextResponse.json({
            status: "success",
            data: notifications,
            total
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur GET /api/notifications:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des notifications." },
            { status: 500 }
        );
    }
}


export async function PUT(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "READ");
    const { userId } = await sessionAccess()

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
        }, { status: 200 });
    }

    if (!userId) {
        return NextResponse.json({
            status: "error",
            message: "Utilisateur non authentifié.",
        }, { status: 401 });
    }

    try {
        const { notificationId } = await req.json();

        if (!notificationId) {
            return NextResponse.json({
                status: "error",
                message: "ID de notification manquant.",
            }, { status: 400 });
        }

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return NextResponse.json({
                status: "error",
                message: "Notification introuvable.",
            }, { status: 404 });
        }

        const notificationRead = await prisma.notificationRead.upsert({
            where: {
                notificationId_userId: {
                    notificationId: notificationId,
                    userId
                }
            },
            create: {
                notificationId: notificationId,
                userId
            },
            update: {
                readAt: new Date()
            }
        });

        return NextResponse.json({
            status: "success",
            data: notificationRead
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur PATCH /api/notifications/read:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors du marquage de la notification." },
            { status: 500 }
        );
    }
}