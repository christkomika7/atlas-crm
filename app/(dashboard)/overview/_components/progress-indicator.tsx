import { Progress } from "@/components/ui/progress";
import { cn, formatNumber } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import React from "react";

type ProgressIndicatorProps = {
  title: string;
  value: number; // valeur courante (en $)
  max?: number; // valeur maximale (par défaut 4000$)
  status?: "positive" | "negative";
};

export default function ProgressIndicator({
  title,
  value,
  max = 100_000_000,
  status = "positive",
}: ProgressIndicatorProps) {
  const currency = useDataStore.use.currency();

  const percentage = (value / max) * 100;

  return (
    <div className="space-y-1.5">
      <h2 className="font-semibold">{title}</h2>
      <div className="relative">
        <Progress
          className="!text-blue h-[30px] rounded-none rounded-r-2xl"
          value={percentage}
          status={status}
        />
        <span className="absolute top-1/2 left-2 -translate-y-1/2 font-semibold text-white">
          {formatNumber(value)} {currency}
        </span>
      </div>
    </div>
  );
}
