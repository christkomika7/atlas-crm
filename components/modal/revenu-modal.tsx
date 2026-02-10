"use client";
import { useDataStore } from "@/stores/data.store";
import { Tabs } from "../ui/tabs";
import EditRevenue from "@/app/(dashboard)/client/[id]/(client)/_components/actions/action-tab/edit-revenue";
import PreviewRevenue from "@/app/(dashboard)/client/[id]/(client)/_components/actions/action-tab/preview-revenue";
import { useEffect, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { RevenueType } from "@/types/client.types";
import { getRevenue } from "@/action/client.action";
import { useParams } from "next/navigation";
import ShareRevenue from "@/app/(dashboard)/client/[id]/(client)/_components/actions/action-tab/share-revenue";

export default function RevenueModal() {
    const param = useParams();
    const [hasNoInvoicePaid, setHasNoInvoicePaid] = useState(false);
    const [date, setDate] = useState<{ start?: Date; end?: Date }>({ start: undefined, end: undefined })
    const [revenues, setRevenues] = useState<RevenueType>();

    const {
        mutate: mutateGetRevenue,
        isPending: isGettingRevenue,
    } = useQueryAction<{
        clientId: string;
        start?: string | undefined;
        end?: string | undefined;
        hasNoInvoicePaid: boolean
    }, RequestResponse<RevenueType>>(
        getRevenue,
        () => { },
        "revenue-client"
    );


    useEffect(() => {
        if (param.id) {
            mutateGetRevenue({
                clientId: param.id as string,
                start: date.start ? date.start.toISOString() : undefined,
                end: date.end ? date.end.toISOString() : undefined,
                hasNoInvoicePaid: hasNoInvoicePaid,
            }, {
                onSuccess(data) {
                    if (data.data) {
                        setRevenues(data.data);
                    }
                },
            });
        }

    }, [param, date, hasNoInvoicePaid]);


    return (
        <div className="flex-1 min-h-0 w-full">
            <Tabs tabs={[
                {
                    id: 1,
                    title: "Modifier",
                    content: <EditRevenue setHasNoInvoicePaid={setHasNoInvoicePaid} hasNoInvoicePaid={hasNoInvoicePaid} setDate={setDate} date={date} revenues={revenues} />,
                },
                {
                    id: 2,
                    title: "Aperçu",
                    content: <PreviewRevenue revenues={revenues} isLoading={isGettingRevenue} />,
                },
                {
                    id: 3,
                    title: "Partage",
                    content: <ShareRevenue revenues={revenues} isLoading={isGettingRevenue} />,
                },
            ]} tabId="revenue-client-tab" />
        </div>
    );
}
