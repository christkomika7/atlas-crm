import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

export default function CreditNoteTab() {
  const creditNotes = [
    {
      id: 1,
      customer: "John Doe",
      date: "2025-09-01",
      amount: 1500,
      action: "View",
    },
    {
      id: 2,
      customer: "Jane Smith",
      date: "2025-09-03",
      amount: 2300,
      action: "View",
    },
    {
      id: 3,
      customer: "Alice Johnson",
      date: "2025-09-05",
      amount: 4200,
      action: "View",
    },
    {
      id: 4,
      customer: "Bob Brown",
      date: "2025-09-07",
      amount: 800,
      action: "View",
    },
    {
      id: 5,
      customer: "Charlie Green",
      date: "2025-09-10",
      amount: 1200,
      action: "View",
    },
  ];

  return (
    <div className="border border-neutral-200 rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium">N°</TableHead>
            <TableHead className="font-medium text-center">Customer</TableHead>
            <TableHead className="font-medium text-center">Date</TableHead>

            <TableHead className="font-medium text-center">Amount</TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditNotes.map((invoice) => (
            <TableRow key={invoice.id} className="h-12 text-center">
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>${invoice.amount}</TableCell>
              <TableCell>
                <button className="text-blue-600 hover:underline">
                  {invoice.action}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
