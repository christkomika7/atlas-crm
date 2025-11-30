import { checkAccess } from "@/lib/access";
import { AttachementProps, sendMail } from "@/lib/email";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { generateAmaId } from "@/lib/utils";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";

export async function POST(req: NextRequest) {
    const result = await checkAccess("PURCHASE_ORDER", "MODIFY");

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


    const [company, purchaseOrder] = await prisma.$transaction([
        prisma.company.findUnique({
            where: { id: data.companyId },
            include: {
                documentModel: true
            }
        }),
        prisma.purchaseOrder.findUnique({
            where: { id: data.recordId },
            include: {
                supplier: true
            }
        })
    ]);


    if (!company) return NextResponse.json(
        { status: "error", message: "Entreprise introuvable." },
        { status: 404 }
    );

    if (!purchaseOrder) return NextResponse.json(
        { status: "error", message: "Bon de commande introuvable." },
        { status: 404 }
    );



    try {
        const filename = `Bon de commande ${company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder.purchaseOrderNumber, false)}.pdf`;
        const blobBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(blobBuffer);

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
            subject: data.subject || `Bon de commande n° ${generateAmaId(purchaseOrder.purchaseOrderNumber, false)} – ${company.companyName}`,
            html: data.message ?
                `
            <div>
                <p>${data.message}</p>
            </div>
            ` :

                `
            <div>
                <p>Bonjour ${purchaseOrder.supplier?.firstname} ${purchaseOrder.supplier?.lastname},</p>
                <p>Vous trouverez ci-joint notre bon de commande n° ${generateAmaId(purchaseOrder.purchaseOrderNumber, false)}.</p>
                <p>Merci de bien vouloir nous confirmer la bonne prise en compte de cette commande ainsi que le délai de livraison prévu.</p>
                <p>Pour toute question, notre service achat reste disponible.</p>
                <p style="color: #000">
                <span>Cordialement,</span><br>                
                <span>Service Achats</span><br>
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