'use client';
import { useEffect, useState } from "react";
import { RequestResponse } from "@/types/api.types";
import { DividendType, TransactionTotal } from "@/types/transaction.type";
import { getDividends, getTransactionTotals } from "@/action/transaction.action";
import { useDataStore } from "@/stores/data.store";
import ProgressIndicator from "./progress-indicator";
import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/utils";

export default function SalesIndicator() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const [dividends, setDividends] = useState<DividendType[]>([]);
  const [receipt, setReceipt] = useState("0");
  const [dibursement, setDibursement] = useState("0");

  const { mutate: mutateGetDividens, isPending: isGettingDividends } = useQueryAction<
    { companyId: string },
    RequestResponse<DividendType[]>
  >(getDividends, () => { }, "dividend");


  const { mutate: mutateGetTotals, isPending: isGettingTotals } = useQueryAction<
    { companyId: string },
    RequestResponse<TransactionTotal>
  >(getTransactionTotals, () => { }, "totals");

  useEffect(() => {
    if (companyId) {
      mutateGetDividens({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setDividends(data.data)
          }
        },
      });

      mutateGetTotals({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setDibursement(data.data.totalDibursement);
            setReceipt(data.data.totalReceipt);
          }
        },
      });

    }
  }, [companyId])

  console.log({ dividends });

  return (
    <div className="p-4 border border-neutral-200  items-center gap-x-8 rounded-lg grid grid-cols-4">
      <div className="h-full">
        <ProgressIndicator title="VAT" value={4000} status="positive" />
      </div>
      <div className="h-full">
        {isGettingDividends ? <Spinner /> :
          dividends.length === 0 ?
            <small className="p-2 bg-neutral-50 flex justify-center items-center h-full rounded-lg">Aucune valeur trouvée</small>
            :
            <div className="space-y-1.5">
              <h2 className="font-semibold">Dividendes</h2>
              {dividends.map((dividend) => (
                <div key={dividend.natureId} className="spac-y-0.5">
                  <h2 className="text-sm font-semibold">{dividend.name}</h2>
                  <div className="relative">
                    <Progress
                      className="!text-blue h-[20px] rounded-none rounded-r-2xl"
                      value={(Number(dividend.total) / 100_000_000) * 100}
                      status="positive"
                    />
                    <span className="absolute top-1/2 left-2 -translate-y-1/2 font-semibold text-white">
                      {formatNumber(dividend.total)} {currency}
                    </span>
                  </div>
                </div>
              ))}

            </div>

        }
      </div>
      <div className="h-full">
        {isGettingTotals ? <Spinner /> :
          <ProgressIndicator
            title="Décaissements"
            value={Number(dibursement || "0")}
            status="positive"
          />
        }
      </div>
      <div className="h-full">
        {isGettingTotals ? <Spinner /> :
          <ProgressIndicator
            title="Encaissements"
            value={Number(receipt || "0")}
            status="positive"
          />
        }
      </div>
    </div>
  );
}
