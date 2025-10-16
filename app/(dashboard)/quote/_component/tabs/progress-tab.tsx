import { Dispatch, RefObject, SetStateAction } from "react";
import QuoteTable, { QuoteTableRef } from "../quote-table";

type ProgressTabProps = {
  quoteTableRef: RefObject<QuoteTableRef | null>;
  selectedQuoteIds: string[];
  setSelectedQuoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function ProgressTab({
  quoteTableRef,
  selectedQuoteIds,
  setSelectedQuoteIds,
}: ProgressTabProps) {
  return (
    <div className="pt-4">
      <QuoteTable
        filter="progress"
        ref={quoteTableRef}
        selectedQuoteIds={selectedQuoteIds}
        setSelectedQuoteIds={setSelectedQuoteIds}
      />
    </div>
  );
}
