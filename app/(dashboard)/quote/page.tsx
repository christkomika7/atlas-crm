"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import UnpaidTab from "./_component/tabs/unpaid-tab";
import PaidTab from "./_component/tabs/paid-tab";
import Link from "next/link";
import { removeManyQuotes } from "@/action/quote.action";
import { QuoteType } from "@/types/quote.types";
import { QuoteTableRef } from "./_component/quote-table";

export default function QuotePage() {
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);

  const quoteTableRef = useRef<QuoteTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<QuoteType[]>
  >(removeManyQuotes, () => { }, "quotes");

  const handleQuoteAdded = () => {
    quoteTableRef.current?.refreshQuote();
  };

  function removeQuotes() {
    if (selectedQuoteIds.length > 0) {
      mutate(
        { ids: selectedQuoteIds },
        {
          onSuccess() {
            setSelectedQuoteIds([]);
            handleQuoteAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Devis">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removeQuotes}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedQuoteIds.length > 0 &&
                  `(${selectedQuoteIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <Link href="/quote/create">
            <Button variant="primary" className="font-medium">
              Nouveau devis
            </Button>
          </Link>
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "En cour",
            content: (
              <UnpaidTab
                quoteTableRef={quoteTableRef}
                selectedQuoteIds={selectedQuoteIds}
                setSelectedQuoteIds={setSelectedQuoteIds}
              />
            ),
          },
          {
            id: 2,
            title: "Terminé",
            content: (
              <PaidTab
                quoteTableRef={quoteTableRef}
                selectedQuoteIds={selectedQuoteIds}
                setSelectedQuoteIds={setSelectedQuoteIds}
              />
            ),
          },
        ]}
        tabId="quote-tab"
      />
    </div>
  );
}
