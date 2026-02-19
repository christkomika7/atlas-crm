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
                }
            });


            if (!receipt) {
                return NextResponse.json({
                    status: "error",
                    message: "Transaction non trouvée.",
                }, { status: 404 });
            }

            return NextResponse.json({
                status: "success",
                data: receipt,
            }, { status: 200 });

        case "dibursement":
            const disbursement = await prisma.dibursement.findUnique({
                where: { id },
                include: {
                    category: true,
                    nature: true,
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
