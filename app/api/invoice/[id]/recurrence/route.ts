import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { RecurrenceType } from "@/types/invoice.types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("INVOICES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const res = await req.json() as RecurrenceType;

    if (!res.companyId && !res.invoiceId && !res.repeat) {
        return NextResponse.json({
            status: "error",
            message: "Certaines valeurs manquent.",
        }, { status: 404 });
    }


    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: res.invoiceId },
            include: {
                project: true,
            }
        });

        if (!invoice) {
            throw new Error("La facture n'existe pas.");
        }

        if (!invoice?.projectId) {
            throw new Error("La facture doit être liée à un projet pour pouvoir créer une récurrence.");
        }


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
