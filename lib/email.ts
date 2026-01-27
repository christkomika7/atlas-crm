import nodemailer from 'nodemailer';

export type AttachementProps = {
    filename: string,
    content: Buffer<ArrayBufferLike>,
    contentType: string,
}

export type SendEmailProps = {
    from: {
        name: string;
        address: string;
    };
    to: string | string[];
    subject: string;
    html: string;
    attachments?: AttachementProps[]
}

const createTransporter = () => {
    return nodemailer.createTransport({
        // service: 'gmail',
        // auth: {
        //     user: process.env.EMAIL_USER,
        //     pass: process.env.EMAIL_PASS,
        // },
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true pour le port 465, false pour les autres ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const base64ToBuffer = (base64String: string): Buffer => {
    const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');
    return Buffer.from(base64Data, 'base64');
};


export async function sendMail(mailOption: SendEmailProps) {
    const transporter = createTransporter();
    await transporter.verify()
    return await transporter.sendMail(mailOption);
}