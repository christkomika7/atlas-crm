"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Sale } from "@/types/item.type";
import { getTotalDuration } from "@/lib/date";
import { useDataStore } from "@/stores/data.store";
import { Decimal } from "decimal.js";
import { formatNumber } from "@/lib/utils";

type RevenueChartProps = {
  sales: Sale[];
};

// 👉 fonction utilitaire pour générer les mois entre deux dates
function getMonthsBetween(start: Date, end: Date) {
  const months: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const monthKey = `${current.getFullYear()}-${(current.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    months.push(monthKey);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// 👉 formatter pour affichage "MMM YYYY"
function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

export function RevenueChart({ sales }: RevenueChartProps) {
  const currency = useDataStore.use.currency();

  const monthMap: Record<string, Decimal> = {};

  for (const sale of sales) {
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);

    const months = getMonthsBetween(start, end);
    const amountPerMonth = sale.amount.div(months.length);

    for (const m of months) {
      monthMap[m] = amountPerMonth.plus((monthMap[m] || 0));
    }
  }

  const chartData = Object.entries(monthMap)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, amount]) => ({
      name: formatMonth(month),
      amount,
    }));

  const totalAmount = chartData.reduce((acc, curr) => acc + curr.amount.toNumber(), 0);
  const totalDuration = getTotalDuration(sales);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[2fr_1.5fr] bg-neutral-100/40 pl-4">
        <p className="flex flex-col px-2 py-2 text-sm">
          <span className="font-medium">Montant moyen par location</span>
          {sales.length > 0 ? (totalAmount / sales.length).toLocaleString() : 0} {currency}
        </p>
        <div className="grid grid-cols-2">
          <p className="flex flex-col bg-neutral-100 px-2 py-2 text-sm">
            <span className="font-medium">Revenu total généré</span>
            {totalAmount.toLocaleString()} {currency}
          </p>
          <p className="flex flex-col bg-neutral-200/50 px-2 py-2 text-sm">
            <span className="font-medium">Durée totale occupée</span>{" "}
            {totalDuration}
          </p>
        </div>
      </div>
      <div>
        <ChartContainer
          config={{
            amount: {
              label: "Montant",
              color: "var(--chart-1)",
            },
          }}
          className="aspect-auto h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer
              margin={{
                left: 0,
                right: 0,
                top: 30, // espace pour les labels
                bottom: 0,
              }}
              data={chartData}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[200px]"
                    nameKey="amount"
                    labelKey="name"
                    formatter={(value) => [
                      `${formatNumber(Number(value).toFixed(1))} ${currency}`,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="amount"
                fill="#334bfe"
                radius={[4, 4, 0, 0]}
                barSize={60}
              >
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(value: number) =>
                    `${formatNumber(Number(value).toFixed(1))} ${currency}`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
