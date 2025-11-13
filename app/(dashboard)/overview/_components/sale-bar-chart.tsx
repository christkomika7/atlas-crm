"use client";

import * as React from "react";
import Decimal from "decimal.js";
import { Pie, PieChart, Cell, Label, Tooltip } from "recharts";

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { colors } from "@/lib/data";
import { toShortNum } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";

export const description = "A donut chart with text (dépenses)";

const chartConfig = {
  depenses: {
    label: "Dépenses",
  },
} satisfies ChartConfig;

type ItemType = {
  id: string;
  name: string;
  total: string;
}

type SaleBarChartProps = {
  currency: string;
  items: ItemType[];
  isLoading: boolean;
};

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload || !payload.length) return null;

  const p = payload[0];
  const isPlaceholder = p?.payload?.isPlaceholder;
  const name = isPlaceholder ? "Aucune dépense" : p?.payload?.name ?? label ?? "Inconnue";
  const value = isPlaceholder ? 0 : (typeof p?.value === "number" ? p.value : Number(p?.value ?? 0));
  const index = p?.payload?.index ?? 0;
  const color = colors[index % colors.length]?.color ?? "#cccccc";

  return (
    <div className="min-w-[160px] max-w-xs p-2 rounded-md shadow-lg bg-white border border-neutral-200">
      <div className="grid grid-cols-[6px_1fr] gap-x-2 items-center">
        <div
          className="w-2 h-full rounded-full"
          style={{ backgroundColor: color }}
        />
        <div>
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-neutral-600">
            {`${toShortNum(value)} ${currency}`}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SaleBarChart({ items, currency, isLoading }: SaleBarChartProps) {
  // chartData: si items vide => placeholder pour que le donut reste visible
  const chartData = React.useMemo(() => {
    if (!items || items.length === 0) {
      return [
        {
          name: "Aucune dépense",
          value: 1, // valeur artificielle pour afficher un donut plein
          id: "placeholder",
          index: 0,
          isPlaceholder: true,
        },
      ];
    }

    return items.map((it, index) => {
      const raw = (it.total ?? "0").toString().replace(",", ".");
      const value = new Decimal(raw || "0").toNumber();
      return {
        name: it.name || it.id,
        value,
        id: it.id,
        index,
        isPlaceholder: false,
      };
    });
  }, [items]);

  // totalDepenses : si items vide -> 0
  const totalDepenses = React.useMemo(() => {
    if (!items || items.length === 0) return 0;
    return chartData.reduce((acc, cur) => acc + (cur.value ?? 0), 0);
  }, [chartData, items]);

  return (
    <div className="relative">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] relative"
      >
        <PieChart>
          {/* Tooltip personnalisé avec couleur */}
          <Tooltip content={<CustomTooltip currency={currency} />} />

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            strokeWidth={5}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => {
              // si placeholder -> gris neutre, sinon couleur du tableau
              const col = entry.isPlaceholder
                ? "#e5e7eb" // neutral-200 gris clair
                : colors[index % colors.length]?.color ?? "#cccccc";
              return <Cell key={`cell-${entry.id}-${index}`} fill={col} />;
            })}

            <Label
              content={(props: any) => {
                const viewBox = props?.viewBox as any;
                if (!viewBox || typeof viewBox.cx !== "number" || typeof viewBox.cy !== "number") return null;

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-lg font-bold"
                    >
                      {toShortNum(totalDepenses)} {currency}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy + 24}
                      className="fill-muted-foreground text-xs"
                    >
                      Dépenses
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-white/25 backdrop-blur-lg p-3">
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
}
