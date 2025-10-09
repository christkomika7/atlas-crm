import { Dispatch, RefObject, SetStateAction } from "react";
import QuoteTable, { QuoteTableRef } from "../quote-table";

type UnpaidTabProps = {
  quoteTableRef: RefObject<QuoteTableRef | null>;
  selectedQuoteIds: string[];
  setSelectedQuoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function UnpaidTab({
  quoteTableRef,
  selectedQuoteIds,
  setSelectedQuoteIds,
}: UnpaidTabProps) {
  return (
    <div className="pt-4">
      <QuoteTable
        filter="unpaid"
        ref={quoteTableRef}
        selectedQuoteIds={selectedQuoteIds}
        setSelectedQuoteIds={setSelectedQuoteIds}
      />
    </div>
  );
}
