"use client";
import { Tabs } from "../ui/tabs";
import { useEffect, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useParams } from "next/navigation";
import { SupplierRevenueType } from "@/types/supplier.types";
import { getSupplierRevenue } from "@/action/supplier.action";
import EditRevenue from "@/app/(dashboard)/supplier/[id]/_components/action-tab/edit-revenue";
import PreviewRevenue from "@/app/(dashboard)/supplier/[id]/_components/action-tab/preview-revenue";
import ShareRevenue from "@/app/(dashboard)/supplier/[id]/_components/action-tab/share-revenue";

export default function SupplierRevenueModal() {
    const param = useParams();
    const [hasNoPurchaseOrderPaid, setHasNoPurchaseOrderPaid] = useState(false);
    const [date, setDate] = useState<{ start?: Date; end?: Date }>({ start: undefined, end: undefined })
    const [revenues, setRevenues] = useState<SupplierRevenueType>();

    const {
        mutate: mutateGetRevenue,
        isPending: isGettingRevenue,
    } = useQueryAction<{
        supplierId: string;
        start?: string | undefined;
        end?: string | undefined;
        hasNoPurchaseOrderPaid: boolean
    }, RequestResponse<SupplierRevenueType>>(
        getSupplierRevenue,
        () => { },
        "revenue-supplier"
    );


    useEffect(() => {
        if (param.id) {
            mutateGetRevenue({
                supplierId: param.id as string,
                start: date.start ? date.start.toISOString() : undefined,
                end: date.end ? date.end.toISOString() : undefined,
                hasNoPurchaseOrderPaid,
            }, {
                onSuccess(data) {
                    if (data.data) {
                        setRevenues(data.data);
                    }
                },
            });
        }

    }, [param, date, hasNoPurchaseOrderPaid]);


    return (
        <div className="flex-1 min-h-0 w-full">
            <Tabs tabs={[
                {
                    id: 1,
                    title: "Modifier",
                    content: <EditRevenue setHasNoPurchaseOrderPaid={setHasNoPurchaseOrderPaid} hasNoPurchaseOrderPaid={hasNoPurchaseOrderPaid} setDate={setDate} date={date} revenues={revenues} />,
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
