import cron from "node-cron";
import { notifyAppointment } from "./cron/appointment";
import { notifyRecurrence } from "./cron/recurrence";

export function startCrons() {
    // 🔹 Toutes les minutes (pour les notifications immédiates)
    cron.schedule("* * * * *", async () => {
        await notifyAppointment();
    });

    // 🔹 Tous les jours à minuit
    cron.schedule("0 0 * * *", async () => {
        await notifyRecurrence({ repeat: "day" });
    });

    // 🔹 Toutes les semaines (chaque lundi à minuit)
    cron.schedule("0 0 * * 1", async () => {
        await notifyRecurrence({ repeat: "week" });

        // 🔹 Toutes les 2 semaines
        const currentWeek = Math.ceil(new Date().getDate() / 7);
        if (currentWeek % 2 === 0) {
            await notifyRecurrence({ repeat: "2-week" });
        }
    });

    // 🔹 Tous les mois (le 1er jour du mois à minuit)
    cron.schedule("0 0 1 * *", async () => {
        await notifyRecurrence({ repeat: "month" });

        // 🔹 Tous les 2 mois
        const currentMonth = new Date().getMonth() + 1;
        if (currentMonth % 2 === 0) {
            await notifyRecurrence({ repeat: "2-month" });
        }

        // 🔹 Tous les trimestres (3, 6, 9, 12)
        if ([3, 6, 9, 12].includes(currentMonth)) {
            await notifyRecurrence({ repeat: "quarter" });
        }

        // 🔹 Tous les semestres (6, 12)
        if ([6, 12].includes(currentMonth)) {
            await notifyRecurrence({ repeat: "semester" });
        }

        // 🔹 Tous les ans (décembre)
        if (currentMonth === 12) {
            await notifyRecurrence({ repeat: "year" });
        }
    });
}
