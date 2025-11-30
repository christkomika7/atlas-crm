import { addDays } from "date-fns";
import { checkAccess } from "@/lib/access";
import { AttachementProps, sendMail } from "@/lib/email";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { NextResponse, type NextRequest } from "next/server";
import { generateAmaId } from "@/lib/utils";
import { paymentTerms } from "@/lib/data";
import { formatDateToDashModel } from "@/lib/date";
import { QUOTE_PREFIX } from "@/config/constant";

export async function POST(req: NextRequest) {
    const result = await checkAccess("QUOTES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const formData = await req.formData();
    const rawData: any = {};
    const files: File[] = [];
    let blob: Blob = formData.get("blob") as Blob;

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
        blob: blob,
        file: files
    }) as RecordEmailSchemaType;


    const [company, quote] = await prisma.$transaction([
        prisma.company.findUnique({
            where: { id: data.companyId },
            include: {
                documentModel: true
            }
        }),
        prisma.quote.findUnique({
            where: { id: data.recordId },
            include: {
                client: true
            }
        })
    ]);


    if (!company) return NextResponse.json(
        { status: "error", message: "Entreprise introuvable." },
        { status: 404 }
    );

    if (!quote) return NextResponse.json(
        { status: "error", message: "Devis introuvable." },
        { status: 404 }
    );


    try {
        const filename = `Devis ${company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(quote.quoteNumber, false)}.pdf`;
        const quoteBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(quoteBuffer);

        const fileAttacments: AttachementProps[] = [];

        const paymentLimit = paymentTerms.find(p => p.value === quote.paymentLimit)?.data ?? 0;
        const validityDate = addDays(new Date(quote.createdAt), paymentLimit);

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
            subject: data.subject || `Votre devis n° ${generateAmaId(quote.quoteNumber, false)} – ${company.companyName}`,
            html: data.message ?
                `
            <div>
                <p>${data.message}</p>
            </div>
            ` :

                `
            <div>
                <p>Veuillez trouver ci-joint le devis n° ${generateAmaId(quote.quoteNumber, false)}.</p>
                <p>Ce devis reste valable jusqu’au ${formatDateToDashModel(validityDate)}. Pour confirmer votre accord, il vous suffit de nous le retourner signé ou de répondre à ce courriel.</p>
                <p>Nous restons à votre disposition pour toute question ou modification.</p>
                <p style="color: #000">
                <span>Cordialement,</span><br>                
                <span>Service Commercial</span><br>
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