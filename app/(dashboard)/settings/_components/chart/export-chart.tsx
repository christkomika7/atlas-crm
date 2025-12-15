"use client";

import * as React from "react";
import Decimal from "decimal.js";
import { Pie, PieChart, Cell, Label, Tooltip } from "recharts";

import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart";
import { colors } from "@/lib/data";
import { formatNumber, toShortNum } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";

const chartConfig = {
    payments: {
        label: "Paiements",
    },
} satisfies ChartConfig;

type ItemType = {
    id: string;
    name: string;
    total: string;
};

type ExportChartProps = {
    currency: string;
    items: ItemType[];
    isLoading: boolean;
};

function CustomTooltip({ active, payload, label, currency }: any) {
    if (!active || !payload || !payload.length) return null;

    const p = payload[0];
    const isPlaceholder = p?.payload?.isPlaceholder;
    const name =
        isPlaceholder ? "Aucun paiement" : p?.payload?.name ?? label ?? "Inconnu";
    const value = isPlaceholder
        ? 0
        : typeof p?.value === "number"
            ? p.value
            : Number(p?.value ?? 0);

    const index = p?.payload?.index ?? 0;
    const color =
        colors[index % colors.length]?.color ?? "#cccccc";

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

export default function ExportChart({
    items,
    currency,
    isLoading,
}: ExportChartProps) {
    const chartData = React.useMemo(() => {
        if (!items || items.length === 0) {
            return [
                {
                    name: "Aucun paiement",
                    value: 1,
                    id: "placeholder",
                    index: 0,
                    isPlaceholder: true,
                },
            ];
        }

        return items
            .map((it, index) => {
                const raw = (it.total ?? "0").toString().replace(",", ".");
                const value = new Decimal(raw || "0").toNumber();

                return {
                    name: it.name || it.id,
                    value,
                    id: it.id,
                    index,
                    isPlaceholder: false,
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [items]);

    const totalPaiements = React.useMemo(() => {
        if (!items || items.length === 0) return 0;
        return chartData.reduce((acc, cur) => acc + (cur.value ?? 0), 0);
    }, [chartData, items]);

    const top5 = chartData.filter(d => !d.isPlaceholder).slice(0, 5);

    return (
        <div className="relative flex gap-6 items-center">
            <ChartContainer
                config={chartConfig}
                className="aspect-square max-h-[250px] w-[250px]"
            >
                <PieChart>
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
                            const col = entry.isPlaceholder
                                ? "#e5e7eb"
                                : colors[index % colors.length]?.color ?? "#cccccc";

                            return (
                                <Cell
                                    key={`cell-${entry.id}-${index}`}
                                    fill={col}
                                />
                            );
                        })}

                        <Label
                            content={(props: any) => {
                                const viewBox = props?.viewBox as any;
                                if (!viewBox) return null;

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
                                            {toShortNum(totalPaiements)} {currency}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy + 24}
                                            className="fill-muted-foreground text-xs"
                                        >
                                            Paiements
                                        </tspan>
                                    </text>
                                );
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>

            <div className="flex-1 space-y-2 fle items-center h-full">
                <div className="text-4xl font-bold text-foreground flex flex-col">
                    <span className="text-base">Total</span> <span className="font-medium">{formatNumber(totalPaiements)} {currency}</span>
                </div>

                {top5.map((item) => {
                    const color =
                        colors[item.index % colors.length]?.color ?? "#cccccc";
                    const percentage =
                        totalPaiements > 0 ? ((item.value / totalPaiements) * 100).toFixed(1) : "0";

                    return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between  border-b border-neutral-200"
                        >
                            <div className="flex items-center gap-1 min-w-0 py-2">
                                <span
                                    className="h-5 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-base truncate">
                                    {item.name}
                                </span>
                            </div>

                            <div className="text-xl font-medium whitespace-nowrap text-right">
                                {formatNumber(item.value)} {currency} ( {percentage}% )
                            </div>
                        </div>
                    );
                })}
            </div>
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