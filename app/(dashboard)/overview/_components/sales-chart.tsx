import { Button } from "@/components/ui/button";
import React from "react";
import { SaleBarChart } from "./sale-bar-chart";

export default function SalesChart() {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg">
      <div className="flex justify-between items-center ">
        <h2 className="font-medium text-neutral-600">
          <span>Periodic sales</span> $50 000 K
        </h2>
        <div className="gap-x-2 flex ">
          <Button variant="outline">Janvier</Button>
          <Button variant="outline">2024</Button>
        </div>
      </div>
      <SaleBarChart />
    </div>
  );
}
