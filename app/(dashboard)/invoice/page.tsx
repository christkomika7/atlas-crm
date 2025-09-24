"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/invoice.action";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { InvoiceTableRef } from "./_component/invoice-table";
import UnpaidTab from "./_component/tabs/unpaid-tab";
import PaidTab from "./_component/tabs/paid-tab";
import { InvoiceType } from "@/types/invoice.types";
import Link from "next/link";

export default function InvoicePage() {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const invoiceTableRef = useRef<InvoiceTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<InvoiceType[]>
  >(removeMany, () => { }, "invoices");

  const handleInvoiceAdded = () => {
    invoiceTableRef.current?.refreshInvoice();
  };

  function removeInvoices() {
    if (selectedInvoiceIds.length > 0) {
      mutate(
        { ids: selectedInvoiceIds },
        {
          onSuccess() {
            setSelectedInvoiceIds([]);
            handleInvoiceAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Factures">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removeInvoices}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedInvoiceIds.length > 0 &&
                  `(${selectedInvoiceIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <Link href="/invoice/create">
            <Button variant="primary" className="font-medium">
              Nouvelle facture
            </Button>
          </Link>
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "Facture impayée",
            content: (
              <UnpaidTab
                invoiceTableRef={invoiceTableRef}
                selectedInvoiceIds={selectedInvoiceIds}
                setSelectedInvoiceIds={setSelectedInvoiceIds}
              />
            ),
          },
          {
            id: 2,
            title: "Facture réglée",
            content: (
              <PaidTab
                invoiceTableRef={invoiceTableRef}
                selectedInvoiceIds={selectedInvoiceIds}
                setSelectedInvoiceIds={setSelectedInvoiceIds}
              />
            ),
          },
        ]}
        tabId="invoice-tab"
      />
    </div>
  );
}
