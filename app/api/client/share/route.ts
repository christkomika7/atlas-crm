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
    const result = await checkAccess("CLIENTS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];
    let revenueBlob: Blob = formData.get("blob") as Blob;

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
        blob: revenueBlob,
        file: files
    }) as RecordEmailSchemaType;


    const client = await prisma.client.findUnique({
        where: { id: data.recordId },
        include: {
            company: true,
        }
    })

    if (!client) return NextResponse.json(
        { status: "error", message: "Client introuvable." },
        { status: 404 }
    );

    try {

        const invoiceBuffer = await revenueBlob.arrayBuffer()
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
                name: client.company.companyName,
                address: process.env.EMAIL_USER as string,
                contentType: 'application/pdf',
            },
            to: data.emails,
            subject: data.subject || `Relevé du client ${client.companyName} du ${formatDateToDashModel(new Date(data.start || new Date()))} au ${formatDateToDashModel(new Date(data.end || new Date()))}`,
            html: data.message ?
                `
            <div>
                <p>${data.message}</p>
            </div>
            ` :

                `
            <div>
                <p>Bonjour ${client?.firstname} ${client?.lastname},</p>
                <p>Veuillez trouver ci-joint votre relevé client de la date du ${formatDateToDashModel(new Date(data.start || new Date()))} au ${formatDateToDashModel(new Date(data.end || new Date()))}.</p>
                <p>Pour toute question ou précision, notre équipe reste à votre disposition.</p>
                <p style="color: #000">
                <span>Cordialement,</span><br>                
                <span>Service Comptabilité</span><br>
                <span style="color: #000;">${client.company.companyName}</span><br>
                <span style="color: #000;">${client.company.phoneNumber}</span>
                </p>
            </div>
        `,
            attachments: [
                {
                    filename: data.filename || "Pièce jointe.pdf",
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