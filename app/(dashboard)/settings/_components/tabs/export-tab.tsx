"use client";
import { Combobox } from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { periods, reportTypes } from "@/lib/data";
import { useState } from "react";
import ExportDataChart from "../export-data-chart";

export default function ExportTab() {
  const [filters, setFilters] = useState({
    reportType: "",
    period: "",
  });

  // Données fictives pour remplir le tableau
  const rows = [
    {
      paymentDate: "2025-09-01",
      invoiceDate: "2025-08-28",
      invoiceNumber: "INV-001",
      client: "Client A",
      total: "2500 €",
      mode: "card",
    },
    {
      paymentDate: "2025-09-02",
      invoiceDate: "2025-08-30",
      invoiceNumber: "INV-002",
      client: "Client B",
      total: "1800 €",
      mode: "check",
    },
    {
      paymentDate: "2025-09-05",
      invoiceDate: "2025-09-01",
      invoiceNumber: "INV-003",
      client: "Client C",
      total: "3200 €",
      mode: "transfer",
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-x-2 max-w-2xl w-full">
        <Combobox
          datas={reportTypes}
          value={filters.reportType}
          setValue={(e) => setFilters({ ...filters, reportType: String(e) })}
          placeholder="Sélectionner un type de rapport"
          searchMessage="Rechercher un type de rapport"
          noResultsMessage="Aucun type de rapport trouvé."
        />
        <Combobox
          datas={periods}
          value={filters.period}
          setValue={(e) => setFilters({ ...filters, period: String(e) })}
          placeholder="Sélectionner une période"
          searchMessage="Rechercher une période"
          noResultsMessage="Aucune période trouvée."
        />
      </div>
      <div className="space-y-2">
        <h2 className="font-semibold">Sales by Clients</h2>
      </div>
      <ExportDataChart />
      <div className="border border-neutral-200 px-4 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium">
                Payment Date
              </TableHead>
              <TableHead className="font-medium text-center">
                Invoice Date
              </TableHead>
              <TableHead className="font-medium text-center">
                Invoice Number
              </TableHead>
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Total</TableHead>
              <TableHead className="font-medium text-center">Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} className="h-12">
                <TableCell>{row.paymentDate}</TableCell>
                <TableCell className="text-center">{row.invoiceDate}</TableCell>
                <TableCell className="text-center">
                  {row.invoiceNumber}
                </TableCell>
                <TableCell className="text-center">{row.client}</TableCell>
                <TableCell className="text-center">{row.total}</TableCell>
                <TableCell className="text-center capitalize">
                  {row.mode}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
