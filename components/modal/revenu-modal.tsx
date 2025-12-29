"use client";
import { useDataStore } from "@/stores/data.store";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs } from "../ui/tabs";
import { tabs } from "@/app/(dashboard)/client/[id]/(client)/_components/actions/action-tab/tab";




type RevenueModalProps = {
    closeModal: () => void;
}

export default function RevenueModal({ closeModal }: RevenueModalProps) {
    const companyId = useDataStore.use.currentCompany();

    return (
        <div className="flex-1 min-h-0 w-full">
            <Tabs tabs={tabs} tabId="revenue-client-tab" />
        </div>
    );
}
