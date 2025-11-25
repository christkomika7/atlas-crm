import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { RecurrenceType } from "@/types/invoice.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("INVOICES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const res = await req.json() as RecurrenceType;

    if (!res.companyId && !res.invoiceId && !res.repeat) {
        return NextResponse.json({
            status: "error",
            message: "Certaines valeurs manquent.",
        }, { status: 404 });
    }

    try {
        await prisma.recurrence.create({
            data: {
                repeat: res.repeat,
                company: {
                    connect: {
                        id: res.companyId
                    }
                },
                invoice: {
                    connect: {
                        id: res.invoiceId
                    }
                }
            }
        })
        return NextResponse.json(
            { state: "success", message: "La récurrence a été effectué avec succès." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Erreur :", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de la création de la récurrence." },
            { status: 500 }
        );
    }
}
