'use client';

import { getBySource } from "@/action/transaction.action";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { cn, formatNumber, isNegative } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { SourceTransaction } from "@/types/transaction.type";
import { Minus, MoveUpRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BanknoteArrowUp } from 'lucide-react';
import { HandCoins } from 'lucide-react';
import { Decimal } from "@prisma/client/runtime/library";



export default function SourceInfos() {
    const [transactions, setTransactions] = useState<SourceTransaction[]>([])
    const currency = useDataStore.use.currency();
    const companyId = useDataStore.use.currentCompany();
    const { mutate, isPending, data } = useQueryAction<
        { companyId: string },
        RequestResponse<SourceTransaction[]>
    >(getBySource, () => { }, "transaction-sources");

    useEffect(() => {
        if (companyId) {
            mutate({ companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setTransactions(data.data)
                    }
                },
            })
        }
    }, [companyId])

    return (
        <ScrollArea className="w-(--left-sidebar-width) overflow-x-hidden pb-2">
            {isPending ? <Spinner /> :
                <div className="p-4 border border-neutral-200 rounded-lg flex gap-x-2">
                    {transactions.map((transaction, index) => (
                        <div key={transaction.sourceId} className={cn("py-2 px-3 w-[200px] -space-y-0.5", index > 0 && "border-l border-neutral-200 ")}>
                            <h2 className={cn("font-bold", isNegative(transaction.difference) ? "text-red" : "text-emerald-500")}>{formatNumber(transaction.difference)} {currency}</h2>
                            <p className="text-sm text-neutral-600 flex gap-x-2 items-center">
                                {transaction.sourceName} {transaction.percentageDifference > 0 ?
                                    <span className="text-emerald-500 flex gap-x-1.5 items-center"> <TrendingUpIcon size={14} /> {transaction.percentageDifference}% </span> :
                                    transaction.percentageDifference === 0 ?
                                        <span className="text-neutral-400 flex gap-x-1.5 items-center"> <Minus size={14} /> {transaction.percentageDifference}% </span> :
                                        <span className="text-red-500 flex gap-x-1.5 items-center"> <TrendingDownIcon size={14} /> {transaction.percentageDifference}% </span>}
                            </p>
                        </div>
                    ))}
                </div>
            }
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
