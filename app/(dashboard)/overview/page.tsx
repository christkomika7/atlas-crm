import AccountHeader from "@/components/header/account-header";
import InvoiceInfos from "./_components/invoice-infos";
import SalesChart from "./_components/sales-chart";
import RecentActivities from "./_components/recent-activities";
import SalesIndicator from "./_components/sales-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoiceTable from "./_components/invoice-table";
import SourceInfos from "./_components/source-infos";
import RecentActivitiesBc from "./_components/recent-activities-bc";
import ActionButton from "./_components/action-button";
import { getSession } from "@/lib/auth";
import { hasAccessToDashboard } from "@/lib/utils";

export default async function OverviewPage() {
  const data = await getSession();
  const canViewDashboard = hasAccessToDashboard(data?.user);

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4">
        <div className="sticky top-0 pb-2 z-10 bg-white left-0">
          <AccountHeader title="Tableau de bord" />
        </div>

        {canViewDashboard ? (
          <>
            <SourceInfos />
            <div className="grid grid-cols-[3fr_1fr] min-h-[94px] gap-4">
              <div className="space-y-2">
                <InvoiceInfos />
              </div>
              <div className="p-2 border h-full border-neutral-200 flex rounded-lg">
                <ActionButton />
              </div>
            </div>
            <div className="grid grid-cols-[1.8fr_1fr_1fr] gap-4">
              <SalesChart />
              <RecentActivitiesBc />
              <RecentActivities />
            </div>
            <SalesIndicator />
            <InvoiceTable />
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Vous n'avez pas accès aux informations du tableau de bord.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
