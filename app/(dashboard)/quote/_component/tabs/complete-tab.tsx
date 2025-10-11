import { Dispatch, RefObject, SetStateAction } from "react";
import QuoteTable, { QuoteTableRef } from "../quote-table";

type CompleteTabProps = {
  quoteTableRef: RefObject<QuoteTableRef | null>;
  selectedQuoteIds: string[];
  setSelectedQuoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function CompleteTab({
  quoteTableRef,
  selectedQuoteIds,
  setSelectedQuoteIds,
}: CompleteTabProps) {
  return (
    <div className="pt-4">
      <QuoteTable
        filter="complete"
        ref={quoteTableRef}
        selectedQuoteIds={selectedQuoteIds}
        setSelectedQuoteIds={setSelectedQuoteIds}
      />
    </div>
  );
}
