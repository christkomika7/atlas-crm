import { Dispatch, RefObject, SetStateAction } from "react";
import QuoteTable, { QuoteTableRef } from "../quote-table";

type PaidTabProps = {
  quoteTableRef: RefObject<QuoteTableRef | null>;
  selectedQuoteIds: string[];
  setSelectedQuoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function PaidTab({
  quoteTableRef,
  selectedQuoteIds,
  setSelectedQuoteIds,
}: PaidTabProps) {
  return (
    <div className="pt-4">
      <QuoteTable
        filter="paid"
        ref={quoteTableRef}
        selectedQuoteIds={selectedQuoteIds}
        setSelectedQuoteIds={setSelectedQuoteIds}
      />
    </div>
  );
}
