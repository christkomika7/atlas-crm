import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;
    const type = req.nextUrl.searchParams.get("type")?.trim() ?? "";

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    switch (type) {
        case "receipt":
            const receipt = await prisma.receipt.findUnique({
                where: { id },
                include: {
                    category: true,
                    nature: true,
                    userAction: true,
                    company: true
                }
            });

            if (!receipt) {
                return NextResponse.json({
                    status: "error",
                    message: "Transaction non trouvée.",
                }, { status: 404 });
            }
            const companyId = receipt.companyId;

            const clients = await prisma.client.findMany({
                where: { companyId }
            });

            const userActions = await prisma.userAction.findMany({
                where: { companyId }
            });

            const userClients = [
                ...clients.map(client => ({ id: client.id, name: `${client.firstname} ${client.lastname}` })),
                ...userActions.map(userAction => ({ id: userAction.id, name: userAction.name }))
            ];


            return NextResponse.json({
                status: "success",
                data: { ...receipt, userClients },
            }, { status: 200 });

        case "dibursement":
            const disbursement = await prisma.dibursement.findUnique({
                where: { id },
                include: {
                    category: true,
                    nature: true,
                    userAction: true
                }
            });

            if (!disbursement) {
                return NextResponse.json({
                    status: "error",
                    message: "Transaction non trouvée.",
                }, { status: 404 });
            }

            return NextResponse.json({
                status: "success",
                data: disbursement,
            }, { status: 200 });

    }
    return NextResponse.json({
        status: "error",
        message: "Type de transaction invalide.",
    }, { status: 400 });
}
