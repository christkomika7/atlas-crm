import { MoveUpRightIcon } from "lucide-react";
import React from "react";

export default function InvoiceInfos() {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg grid grid-cols-3">
      <div className="py-2 px-3">
        <h2 className="font-bold">420K</h2>
        <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
          Invoices Issue <MoveUpRightIcon className="size-4" /> 12%
        </p>
      </div>
      <div className="py-2 px-3 border-x border-neutral-200">
        <h2 className="font-bold text-red">980K</h2>
        <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
          Invoices Issue <MoveUpRightIcon className="size-4" /> 20%
        </p>
      </div>
      <div className="py-2 px-3">
        <h2 className="font-bold text-red">230K</h2>
        <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
          Suppliers Debts <MoveUpRightIcon className="size-4" /> 53%
        </p>
      </div>
    </div>
  );
}
