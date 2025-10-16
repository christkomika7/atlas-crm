import { checkAccess } from "@/lib/access"
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");
    const companyId = getIdFromUrl(req.url, 2);

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    const [invoices] = await prisma.$transaction([
        prisma.invoice.findMany({
            where: {
                companyId,
                // isPaid: true
            },
            select: {
                id: true,
                totalTTC: true,
                invoiceNumber: true,
                company: {
                    select: {
                        currency: true,
                        documentModel: {
                            select: {
                                invoicesPrefix: true
                            }
                        }
                    }
                },

            }
        })
    ]);

    const parsedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        type: "Facture",
        reference: `${invoice.company.documentModel?.invoicesPrefix ?? "FACTURE"}-${invoice.invoiceNumber}`,
        price: invoice.totalTTC,
        currency: invoice.company.currency,
    }));

    const documents = [...parsedInvoices];

    return NextResponse.json({
        state: "success",
        data: documents,
    }, { status: 200 })

}