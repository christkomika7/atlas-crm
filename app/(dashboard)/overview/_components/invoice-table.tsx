import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import React from "react";

export default function InvoiceTable() {
  const invoices = [
    {
      id: 1,
      product: "Laptop",
      customer: "John Doe",
      amountUnpaid: 1200,
      amountPaid: 300,
      status: "Pending",
      action: "View",
    },
    {
      id: 2,
      product: "Smartphone",
      customer: "Jane Smith",
      amountUnpaid: 800,
      amountPaid: 200,
      status: "Partial",
      action: "View",
    },
    {
      id: 3,
      product: "Monitor",
      customer: "Alice Johnson",
      amountUnpaid: 0,
      amountPaid: 450,
      status: "Paid",
      action: "View",
    },
    {
      id: 4,
      product: "Keyboard",
      customer: "Bob Brown",
      amountUnpaid: 50,
      amountPaid: 100,
      status: "Partial",
      action: "View",
    },
    {
      id: 5,
      product: "Mouse",
      customer: "Charlie Green",
      amountUnpaid: 0,
      amountPaid: 70,
      status: "Paid",
      action: "View",
    },
  ];

  return (
    <div className="p-4 border border-neutral-200 gap-x-8 rounded-lg space-y-2">
      <h2 className="font-semibold">Invoices in progress</h2>
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium">#</TableHead>
            <TableHead className="font-medium text-center">Product</TableHead>
            <TableHead className="font-medium text-center">Customers</TableHead>
            <TableHead className="font-medium text-center">
              Amounts unpaid
            </TableHead>
            <TableHead className="font-medium text-center">
              Amounts paid
            </TableHead>
            <TableHead className="font-medium text-center">Status</TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="h-12 text-center">
              <TableCell>{invoice.id}</TableCell>
              <TableCell>{invoice.product}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>${invoice.amountUnpaid}</TableCell>
              <TableCell>${invoice.amountPaid}</TableCell>
              <TableCell>{invoice.status}</TableCell>
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
