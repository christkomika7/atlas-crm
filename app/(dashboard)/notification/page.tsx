import OverviewHeader from "@/components/header/account-header";
import Notifications from "./_components/notifications";

export default function NotificationPage() {
  return (
    <div className="space-y-4">
      <div className="sticky top-0 pb-2 z-10 bg-white left-0">
        <OverviewHeader title="Notification" />
      </div>
      <div className="px-4">
        <Notifications />
      </div>
    </div>
  );
}
