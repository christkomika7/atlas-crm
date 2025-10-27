import AccountHeader from "@/components/header/account-header";
import InvoiceInfos from "./_components/invoice-infos";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/icons";
import SalesChart from "./_components/sales-chart";
import RecentActivities from "./_components/recent-activities";
import SalesIndicator from "./_components/sales-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoiceTable from "./_components/invoice-table";
import SourceInfos from "./_components/source-infos";
import RecentActivitiesBc from "./_components/recent-activities-bc";

export default function OverviewPage() {
  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4">
        <div className="sticky top-0 pb-2 z-10 bg-white left-0">
          <AccountHeader title="Tableau de bord" />
        </div>
        <SourceInfos />
        <div className="grid grid-cols-[3fr_1fr] gap-4">
          <div className="space-y-2">
            <InvoiceInfos />
          </div>
          <div className="p-4 border h-fit border-neutral-200 flex rounded-lg">
            <Button variant="primary" className="!h-14">
              Ajouter <ChevronDownIcon className="!size-4 stroke-white" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-[3fr_1fr_1fr] gap-4">
          <SalesChart />
          <RecentActivitiesBc />
          <RecentActivities />
        </div>
        <SalesIndicator />
        <InvoiceTable />
      </div>
    </ScrollArea>
  );
}
