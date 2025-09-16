import React from "react";
import ProgressIndicator from "./progress-indicator";

export default function SalesIndicator() {
  return (
    <div className="p-4 border border-neutral-200 flex items-center gap-x-8 rounded-lg grid grid-cols-4">
      <ProgressIndicator title="VAT" value={4000} status="positive" />
      <ProgressIndicator title="Dividends" value={4000} status="positive" />
      <ProgressIndicator
        title="Expenses Disbursement"
        value={4000}
        status="negative"
      />
      <ProgressIndicator
        title="Money entrances"
        value={4000}
        status="positive"
      />
    </div>
  );
}
