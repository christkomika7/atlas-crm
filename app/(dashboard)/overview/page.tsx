import AccountHeader from "@/components/header/account-header";
import InvoiceInfos from "./_components/invoice-infos";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/icons";
import SalesChart from "./_components/sales-chart";
import RecentActivities from "./_components/recent-activities";
import SalesIndicator from "./_components/sales-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoiceTable from "./_components/invoice-table";

export default function OverviewPage() {
  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4">
        <div className="sticky top-0 pb-2 z-10 bg-white left-0">
          <AccountHeader title="Overview" />
        </div>
        <div className="grid grid-cols-[3fr_1fr] gap-4">
          <InvoiceInfos />
          <div className="p-4 border border-neutral-200 flex items-center rounded-lg">
            <Button variant="primary" className="!h-14">
              Ajouter <ChevronDownIcon className="!size-4 stroke-white" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[3fr_1fr] gap-4">
          <SalesChart />
          <RecentActivities />
        </div>
        <SalesIndicator />
        <InvoiceTable />
      </div>
    </ScrollArea>
  );
}
