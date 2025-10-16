import OverviewHeader from "@/components/header/account-header";
import Notifications from "./notifications";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationPage() {
  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4">
        <div className="sticky top-0 pb-2 z-10 bg-white left-0">
          <OverviewHeader title="Notification" />
        </div>
        <div className="px-4">
          <Notifications />
        </div>
      </div>
    </ScrollArea>
  );
}
