import prisma from "../prisma";
import { addDays } from "date-fns";

export async function taskStatus() {
    const now = new Date();
    const threeDaysAfter = addDays(now, 3);

    const tasksToUpdate = await prisma.task.findMany({
        where: {
            time: {
                lte: threeDaysAfter,
            },
            priority: {
                not: "URGENT",
            },
        },
    });

    if (tasksToUpdate.length === 0) {
        return false;
    }

    await prisma.task.updateMany({
        where: {
            id: {
                in: tasksToUpdate.map((t) => t.id),
            },
        },
        data: {
            priority: "URGENT",
        },
    });

    return true;
}
