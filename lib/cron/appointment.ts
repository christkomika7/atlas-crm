import { format } from "date-fns";
import { formatDateToDashModel } from "../date";
import { sendMail } from "../email";
import prisma from "../prisma";

export async function notifyAppointment() {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    // 🔹 Conversion des heures au format "HH:mm"
    const currentTimeStr = format(now, "HH:mm");
    const fiveMinutesLaterStr = format(fiveMinutesLater, "HH:mm");

    // 🔹 Début et fin de la journée (pour vérifier que c’est la date d’aujourd’hui)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // ✅ Prisma : date = aujourd’hui, time entre maintenant et +5min
    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: startOfDay,
                lt: endOfDay,
            },
            time: {
                gte: currentTimeStr,
                lt: fiveMinutesLaterStr,
            },
            notify: true,
        },
        select: {
            id: true,
            subject: true,
            time: true,
            date: true,
            email: true,
            company: {
                select: { companyName: true },
            },
        },
    });

    for (const appointment of appointments) {
        const mailOptions = {
            from: {
                name: appointment.company.companyName || "Votre Entreprise",
                address: process.env.EMAIL_USER as string
            },
            to: appointment.email,
            subject: "📅 Rappel de votre rendez-vous à venir",
            html: `
                      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color:#2a7ae2;">📅 Rappel de rendez-vous</h2>
        <p>Bonjour,</p>
        <p>Nous vous rappelons que votre rendez-vous est prévu :</p>
        <p style="font-size:16px; font-weight:bold; color:#2a7ae2;">
          🗓️ Le <strong>${formatDateToDashModel(appointment.date)}</strong> à <strong>${appointment.time}</strong>
        </p>
        <p>Merci de bien vouloir vous présenter quelques minutes à l’avance.</p>
        <p>
          Si vous souhaitez modifier ou annuler ce rendez-vous,
          veuillez nous contacter au plus tard 24h à l’avance.
        </p>
        <br />
        <p>Cordialement,<br />L’équipe <strong>${appointment.company.companyName}</strong></p>
      </div>
                    `
        }
        const n = await sendMail(mailOptions);
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                notify: false
            }
        })
    }
}