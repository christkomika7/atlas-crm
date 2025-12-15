import { format } from "date-fns";
import { formatDateToDashModel } from "../date";
import { sendMail } from "../email";
import prisma from "../prisma";

export async function notifyAppointment() {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const currentTimeStr = format(now, "HH:mm");
    const fiveMinutesLaterStr = format(fiveMinutesLater, "HH:mm");

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

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
        include: {
            teamMember: {
                include: {
                    user: true
                }
            },
            company: {
                include: {
                    profiles: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            client: true
        },
    });

    for (const appointment of appointments) {
        const notification = await prisma.notification.create({
            data: {
                type: "ALERT",
                for: "APPOINTMENT",
                message: `La réunion programmée avec ${appointment.client.companyName} (${appointment.client.firstname} ${appointment.client.lastname}) est désormais en cours.`,
                appointment: {
                    connect: { id: appointment.id },
                },
                company: {
                    connect: { id: appointment.company.id },
                },
            },
        });

        const userIds: string[] = [];

        if (appointment.teamMember?.user?.id) {
            userIds.push(appointment.teamMember.user.id);
        } else {
            const companyUserIds = appointment.company.profiles
                .map(profile => profile.user.id)
                .filter(Boolean);
            userIds.push(...companyUserIds);
        }


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
                    <p>Merci de bien vouloir vous présenter quelques minutes à l'avance.</p>
                    <p>
                        Si vous souhaitez modifier ou annuler ce rendez-vous,
                        veuillez nous contacter au plus tard 24h à l'avance.
                    </p>
                    <br />
                    <p>Cordialement,<br />L'équipe <strong>${appointment.company.companyName}</strong></p>
                </div>
            `
        };

        await sendMail(mailOptions);

        await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                notify: false
            }
        });
    }
}