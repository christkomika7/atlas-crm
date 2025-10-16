"use client";
import React from "react";
import { RevenueChart } from "./revenue-chart";
import { Sale } from "@/types/item.type";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarRangeIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

type BillboardRevenueProps = {
  sales: Sale[];
};

export default function BillboardRevenue({ sales }: BillboardRevenueProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );

  const filteredSales = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return sales;

    return sales.filter((sale) => {
      const saleStart = new Date(sale.startDate);
      const saleEnd = new Date(sale.endDate);
      return saleEnd >= dateRange.from! && saleStart <= dateRange.to!;
    });
  }, [sales, dateRange]);

  const clearDateRange = () => {
    setDateRange(undefined);
  };

  return (
    <div className="bg-neutral-50">
      <div className="flex p-3 items-center justify-between gap-x-2">
        <h2 className="font-semibold">Répartition des revenus</h2>

        <div className="flex items-center gap-2">
          {dateRange?.from && dateRange?.to && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center shadow-none gap-2"
              >
                <CalendarRangeIcon className="w-4 h-4" />
                {dateRange?.from && dateRange?.to ? (
                  <span>
                    {dateRange.from.toLocaleDateString("fr-FR")} →{" "}
                    {dateRange.to.toLocaleDateString("fr-FR")}
                  </span>
                ) : (
                  <span>Filtrer par période</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-[250px]">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="w-full h-fit">
        <RevenueChart sales={filteredSales} />
      </div>
    </div>
  );
}
