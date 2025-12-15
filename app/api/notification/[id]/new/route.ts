import { checkAccess, sessionAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "READ");
    const { userId } = await sessionAccess();

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: { hasUnread: false }
        }, { status: 200 });
    }

    const companyId = getIdFromUrl(req.url, 2) as string;

    if (!companyId || !userId) {
        return NextResponse.json({
            status: "error",
            message: "Paramètres manquants.",
            data: { hasUnread: false }
        }, { status: 400 });
    }

    try {
        const unreadCount = await prisma.notification.count({
            where: {
                companyId,
                NOT: {
                    readBy: {
                        some: {
                            userId
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            data: {
                hasUnread: unreadCount > 0,
                count: unreadCount
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Erreur GET /api/notifications/check-unread:", error);
        return NextResponse.json(
            {
                status: "error",
                message: "Erreur lors de la vérification des notifications.",
                data: { hasUnread: false }
            },
            { status: 500 }
        );
    }
}