import { checkAccess } from "@/lib/access";
import { AttachementProps, sendMail } from "@/lib/email";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { NextResponse, type NextRequest } from "next/server";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { formatDateToDashModel } from "@/lib/date";
import { INVOICE_PREFIX } from "@/config/constant";

export async function POST(req: NextRequest) {
    const result = await checkAccess("INVOICES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];
    let invoiceBlob: Blob = formData.get("blob") as Blob;

    formData.forEach((value, key) => {
        if (key === "files" && value instanceof File) {
            files.push(value);
        }
        else {
            rawData[key] = value as string;
        }
    });

    const data = parseData<RecordEmailSchemaType>(recordEmailSchema, {
        ...rawData,
        emails: JSON.parse(rawData.emails),
        blob: invoiceBlob,
        file: files
    }) as RecordEmailSchemaType;


    const [company, invoice] = await prisma.$transaction([
        prisma.company.findUnique({
            where: { id: data.companyId },
            include: {
                documentModel: true
            }
        }),
        prisma.invoice.findUnique({
            where: { id: data.recordId },
            include: {
                client: true,
                project: true,
            }
        })
    ]);


    if (!company) return NextResponse.json(
        { status: "error", message: "Entreprise introuvable." },
        { status: 404 }
    );

    if (!invoice) return NextResponse.json(
        { status: "error", message: "Facture introuvable." },
        { status: 404 }
    );

    if (!invoice.projectId) {
        return NextResponse.json(
            { status: "error", message: "La facture doit être liée à un projet pour pouvoir envoyer un email." },
            { status: 404 }
        );
    }

    try {
        const filename = `Facture ${company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}.pdf`;
        const invoiceBuffer = await invoiceBlob.arrayBuffer()
        const buffer = Buffer.from(invoiceBuffer);

        const fileAttacments: AttachementProps[] = [];


        for (const uploadedFile of data.file ?? []) {
            const fileBuffer = await uploadedFile.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            fileAttacments.push({
                filename: uploadedFile.name || "Pièce jointe.pdf",
                content: buffer,
                contentType: 'application/pdf',
            });
        }

        const mailOptions = {
            from: {
                name: company.companyName,
                address: process.env.EMAIL_USER as string,
                contentType: 'application/pdf',
            },
            to: data.emails,
            subject: data.subject || `Votre facture n° ${generateAmaId(invoice.invoiceNumber, false)} – ${company.companyName}`,
            html: data.message ?
                `
            <div>
                <p>${data.message}</p>
            </div>
            ` :

                `
            <div>
                <p>Bonjour ${invoice.client?.firstname} ${invoice.client?.lastname},</p>
                <p>Veuillez trouver ci-joint votre facture n° ${generateAmaId(invoice.invoiceNumber, false)} d’un montant de ${formatNumber(invoice.amountType === "TTC" ? invoice.totalTTC.toNumber() : invoice.totalHT.toNumber())} ${company.currency} .</p>
                <p>Merci d’effectuer le règlement avant le ${formatDateToDashModel(new Date(invoice.paymentLimit))}, conformément aux conditions indiquées sur la facture.</p>
                <p>Pour toute question ou précision, notre équipe reste à votre disposition.</p>
                <p style="color: #000">
                <span>Cordialement,</span><br>                
                <span>Service Comptabilité</span><br>
                <span style="color: #000;">${company.companyName}</span><br>
                <span style="color: #000;">${company.phoneNumber}</span>
                </p>
            </div>
        `,
            attachments: [
                {
                    filename,
                    content: buffer,
                    contentType: 'application/pdf',
                },
                ...fileAttacments,
            ]
        }

        await sendMail(mailOptions);

        return NextResponse.json(
            {
                state: true,
                message: "Le mail à été envoyé avec succès"
            },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            {
                state: false,
                message: "Le mail n'a pas pu être envoyé, veuillez réessayer."
            },
            { status: 500 }
        );
    }


}