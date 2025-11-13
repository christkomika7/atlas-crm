import { cn } from "@/lib/utils";
import { isWithinInterval, subDays, addDays, startOfDay } from "date-fns";

type BillboardStatusProps = {
    items: Date[][];
};

export default function BillboardStatus({ items }: BillboardStatusProps) {
    const today = startOfDay(new Date());

    let status: "red" | "orange" | "green" = "green";

    for (const [start, end] of items) {
        const startDay = startOfDay(new Date(start));
        const endDay = startOfDay(new Date(end));

        if (isWithinInterval(today, { start: startDay, end: endDay })) {
            status = "red";
            break;
        }

        const beforeStart = isWithinInterval(today, {
            start: subDays(startDay, 10),
            end: startDay,
        });

        const afterEnd = isWithinInterval(today, {
            start: endDay,
            end: addDays(endDay, 10),
        });

        if (beforeStart || afterEnd) {
            status = "orange";
        }
    }

    return <div className={cn("flex mx-auto rounded-full w-5 h-5", status === "red" ? "bg-red" : status === "orange" ? "bg-amber-400" : "bg-emerald-500")}></div>;
}
