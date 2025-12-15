import { BellOff } from "lucide-react";

export default function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
        <BellOff className="size-5 text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-1">
        Aucune notification
      </h2>

      <p className="max-w-sm text-sm text-muted-foreground">
        Vous n’avez aucune notification pour le moment. Lorsqu’un événement important
        se produira, il apparaîtra ici.
      </p>
    </div>
  );
}
