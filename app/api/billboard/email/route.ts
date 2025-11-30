import { checkAccess } from '@/lib/access';
import { base64ToBuffer, sendMail } from '@/lib/email';
import { parseData } from '@/lib/parse';
import prisma from '@/lib/prisma';
import { emailSchema, EmailSchemaType } from '@/lib/zod/email.schema';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    try {
        const body = await request.json();

        const data = parseData<EmailSchemaType>(
            emailSchema,
            body
        ) as EmailSchemaType;

        const { email, message, contract, companyId } = data;

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Variables d\'environnement EMAIL_USER ou EMAIL_PASS manquantes');
            return NextResponse.json(
                {
                    success: false,
                    message: "Configuration email manquante"
                },
                { status: 500 }
            );
        }

        const company = await prisma.company.findUnique({ where: { id: companyId } })

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Aucune entreprise trouvée"
                },
                { status: 400 }
            );
        }


        const pdfBuffer = base64ToBuffer(contract);
        const fileName = `contrat-${Date.now()}.pdf`;

        const mailOptions = {
            from: {
                name: company.companyName || 'Votre Entreprise',
                address: process.env.EMAIL_USER,
            },
            to: email,
            subject: 'Votre contrat de location de panneau publicitaire',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Contrat de location de panneau publicitaire</h2>
          
          <p>Bonjour,</p>
          
          <p>Veuillez trouver ci-joint votre contrat de location de panneau publicitaire.</p>
          
          ${message ? `
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h4 style="margin-top: 0;">Message personnalisé :</h4>
              <p style="margin-bottom: 0;">${message}</p>
            </div>
          ` : ''}
          
          <p>Merci de bien vouloir le signer et nous le retourner.</p>
          
          <p>Cordialement,<br>
          L'équipe de gestion</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      `,
            text: `
        Contrat de location de panneau publicitaire
        
        Bonjour,
        
        Veuillez trouver ci-joint votre contrat de location de panneau publicitaire.
        
        ${message ? `Message personnalisé : ${message}` : ''}
        
        Merci de bien vouloir le signer et nous le retourner.
        
        Cordialement,
        L'équipe de gestion
      `,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        const mail = await sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: "Email envoyé avec succès",
            messageId: mail.messageId,
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);

        // Gestion des erreurs spécifiques
        if (error instanceof Error) {
            // Erreurs de configuration Nodemailer
            if (error.message.includes('Invalid login')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Erreur d'authentification email. Vérifiez vos identifiants."
                    },
                    { status: 401 }
                );
            }

            // Erreurs de réseau
            if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Erreur de connexion au serveur email."
                    },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                message: "Erreur lors de l'envoi de l'email",
            },
            { status: 500 }
        );
    }
}