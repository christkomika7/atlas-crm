import { Tabs } from "@/components/ui/tabs";
import { activities } from "./activities";
import useClientStore from "@/stores/client.store";
import { formatNumber } from "@/lib/utils";

export default function ActivityTab() {
  const client = useClientStore.use.client();
  return (
    <div className="space-y-2.5 pt-4">
      <h2 className="font-semibold text-neutral-600 text-2xl">
        Montant: {client?.paidAmount && formatNumber(client?.due)}{" "}
        {client?.company.currency}
      </h2>
      <Tabs tabs={activities} tabId="activity-tab" />
    </div>
  );
}
