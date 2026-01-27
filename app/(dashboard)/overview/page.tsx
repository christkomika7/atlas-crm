import AccountHeader from "@/components/header/account-header";
import InvoiceInfos from "./_components/invoice-infos";
import SalesChart from "./_components/sales-chart";
import RecentActivities from "./_components/recent-activities";
import SalesIndicator from "./_components/sales-indicator";
import InvoiceTable from "./_components/invoice-table";
import SourceInfos from "./_components/source-infos";
import RecentActivitiesBc from "./_components/recent-activities-bc";
import ActionButton from "./_components/action-button";
import { getSession } from "@/lib/auth";
import { hasAccess } from "@/lib/utils";

export default async function OverviewPage() {
  const data = await getSession();
  const role = data?.user.role || "USER";
  const profileId = data?.user.currentProfile;
  const profiles = data?.user.profiles
  const permissions = profiles?.find(p => p.id === profileId)?.permissions || [];

  const canViewDashboard = hasAccess("DASHBOARD", ["READ", "CREATE", "MODIFY"], permissions, role);
  const quotePermission = hasAccess("QUOTES", ["CREATE"], permissions, role);
  const invoicePermission = hasAccess("INVOICES", ["CREATE"], permissions, role);
  const deliveryNotePermission = hasAccess("DELIVERY_NOTES", ["CREATE"], permissions, role);
  const purchaseOrderPermission = hasAccess("PURCHASE_ORDER", ["CREATE"], permissions, role);

  return (
    <div className="pr-4 h-full">
      <div className="space-y-4 relative">
        <AccountHeader title="Tableau de bord" />

        {canViewDashboard ? (
          <>
            <SourceInfos canViewDashboard={canViewDashboard} />
            <div className="grid grid-cols-[3fr_1fr] min-h-23.5 gap-4">
              <div className="space-y-2">
                <InvoiceInfos canViewDashboard={canViewDashboard} />
              </div>
              <div className="p-2 border h-full border-neutral-200 flex rounded-lg">
                <ActionButton
                  quotePermission={quotePermission}
                  deliveryNotePermission={deliveryNotePermission}
                  invoicePermission={invoicePermission}
                  purchaseOrderPermission={purchaseOrderPermission}
                />
              </div>
            </div>
            <div className="grid grid-cols-[1.8fr_1fr_1fr] gap-4">
              <SalesChart canViewDashboard={canViewDashboard} />
              <RecentActivitiesBc canViewDashboard={canViewDashboard} />
              <RecentActivities canViewDashboard={canViewDashboard} />
            </div>
            <SalesIndicator canViewDashboard={canViewDashboard} />
            <InvoiceTable canViewDashboard={canViewDashboard} />
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Vous n'avez pas accès aux informations du tableau de bord.
          </p>
        )}
      </div>
    </div>
  );
}
