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
import Decimal from "decimal.js";
import { formatNumber, toShortNum } from "@/lib/utils";
import { MAX_BARS, MS_PER_DAY } from "@/config/constant";

type RevenueChartProps = {
  sales: Sale[];
};



function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function daysBetweenInclusive(a: Date, b: Date) {
  const ad = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 12);
  const bd = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 12);
  return Math.round((bd.getTime() - ad.getTime()) / MS_PER_DAY) + 1;
}

function getMonthKeysBetween(start: Date, end: Date) {
  const keys: string[] = [];
  let cur = startOfMonth(start);
  const last = endOfMonth(end);
  while (cur <= last) {
    const key = `${cur.getFullYear()}-${(cur.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    keys.push(key);
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return keys;
}

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
    const start =
      sale.startDate instanceof Date ? sale.startDate : new Date(sale.startDate);
    const end =
      sale.endDate instanceof Date ? sale.endDate : new Date(sale.endDate);

    const totalDays = daysBetweenInclusive(start, end);
    if (totalDays <= 0) continue;

    const months = getMonthKeysBetween(start, end);
    const amountDecimal = new Decimal(sale.amount);

    for (const mKey of months) {
      const [y, mStr] = mKey.split("-");
      const monthIndex = Number(mStr) - 1;
      const monthStart = new Date(Number(y), monthIndex, 1);
      const monthEnd = endOfMonth(monthStart);

      const overlapStart = start > monthStart ? start : monthStart;
      const overlapEnd = end < monthEnd ? end : monthEnd;

      const daysInThisMonth = daysBetweenInclusive(overlapStart, overlapEnd);
      if (daysInThisMonth <= 0) continue;

      const part = amountDecimal
        .mul(new Decimal(daysInThisMonth))
        .div(new Decimal(totalDays));

      if (!monthMap[mKey]) monthMap[mKey] = new Decimal(0);
      monthMap[mKey] = monthMap[mKey].plus(part);
    }
  }

  // 👉 tri + limite à 20 barres max
  const sortedEntries = Object.entries(monthMap).sort(([a], [b]) =>
    a < b ? -1 : 1
  );

  const limitedEntries =
    sortedEntries.length > MAX_BARS
      ? sortedEntries.slice(-MAX_BARS)
      : sortedEntries;

  const chartData = limitedEntries.map(([month, amount]) => ({
    name: formatMonth(month),
    amount: amount.toNumber(),
  }));

  const totalAmount = chartData.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDuration = getTotalDuration(sales);

  return (
    <div className="space-y-4">
      {/* résumé */}
      <div className="grid grid-cols-[2fr_1.5fr] bg-neutral-100/40 pl-4">
        <p className="flex flex-col px-2 py-2 text-sm">
          <span className="font-medium">Montant moyen par location</span>
          {sales.length > 0
            ? (totalAmount / sales.length).toLocaleString()
            : 0}{" "}
          {currency}
        </p>
        <div className="grid grid-cols-2">
          <p className="flex flex-col bg-neutral-100 px-2 py-2 text-sm">
            <span className="font-medium">Revenu total généré</span>
            {formatNumber(Number(totalAmount.toFixed(2)))} {currency}
          </p>
          <p className="flex flex-col bg-neutral-200/50 px-2 py-2 text-sm">
            <span className="font-medium">Durée totale occupée</span>{" "}
            {totalDuration}
          </p>
        </div>
      </div>

      {/* graphique */}
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
                top: 30,
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
                      `${formatNumber(Number(Number(value).toFixed(1)))} ${currency}`,
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
                    `${toShortNum(Number(value.toFixed(1)))} ${currency}`
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
