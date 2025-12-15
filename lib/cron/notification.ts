import { INVOICE_PREFIX } from "@/config/constant";
import { dueDate } from "../date";
import { format } from "date-fns";
import { generateAmaId } from "../utils";

import prisma from "../prisma";

export async function notifyDueInvoices() {
    const invoices = await prisma.invoice.findMany({
        where: {
            isPaid: false
        },
        include: {
            company: {
                include: {
                    documentModel: true,
                    profiles: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    for (const invoice of invoices) {
        const due = dueDate(invoice.createdAt, invoice.paymentLimit).value;
        if (due === 0) {
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    invoiceId: invoice.id,
                    for: "INVOICE",
                    type: "ALERT"
                }
            });

            if (!existingNotification) {
                await prisma.notification.create({
                    data: {
                        type: "ALERT",
                        for: "INVOICE",
                        message: `La facture ${invoice.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)} a atteint la date d'échéance.`,
                        invoice: {
                            connect: {
                                id: invoice.id
                            }
                        },
                        company: {
                            connect: {
                                id: invoice.companyId
                            }
                        }
                    }
                });
            }
        }
    }
}

export async function notifyRendezVous() {
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

    const currentTimeStr = format(now, "HH:mm");
    const thirtyMinutesLaterStr = format(thirtyMinutesLater, "HH:mm");

    const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );

    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: startOfDay,
                lt: endOfDay,
            },
            time: {
                gte: currentTimeStr,
                lt: thirtyMinutesLaterStr,
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
        const existingNotification = await prisma.notification.findFirst({
            where: {
                appointmentId: appointment.id,
                for: "APPOINTMENT",
                type: "ALERT",
                message: {
                    contains: "dans 30 minutes"
                }
            }
        });

        if (!existingNotification) {
            await prisma.notification.create({
                data: {
                    type: "ALERT",
                    for: "APPOINTMENT",
                    message: `Vous avez un rendez-vous prévu avec ${appointment.client.companyName} (${appointment.client.firstname} ${appointment.client.lastname}) dans 30 minutes.`,
                    appointment: {
                        connect: { id: appointment.id },
                    },
                    company: {
                        connect: { id: appointment.company.id },
                    },
                },
            });
        }
    }
}

export async function notifyTask() {
    const now = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(now.getDate() + 2);

    const tasks = await prisma.task.findMany({
        where: {
            time: {
                gt: now,
                lte: twoDaysLater
            },
        },
        include: {
            users: {
                include: {
                    user: true
                }
            },
            project: {
                include: {
                    company: {
                        include: {
                            profiles: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    for (const task of tasks) {
        const existingNotification = await prisma.notification.findFirst({
            where: {
                taskId: task.id,
                for: "TASK",
                type: "ALERT"
            }
        });

        if (!existingNotification) {
            await prisma.notification.create({
                data: {
                    type: "ALERT",
                    for: "TASK",
                    message: `La tâche '${task.taskName}' arrive bientôt à échéance.`,
                    task: {
                        connect: { id: task.id }
                    },
                    company: {
                        connect: { id: task.project.companyId }
                    }
                }
            });
        }
    }
}