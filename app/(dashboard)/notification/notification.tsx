import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileCheck2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";

type NotificationProps = {
  title: string;
  content: string;
  type: "action" | "signal";
  last?: boolean;
};

export default function Notification({
  title,
  content,
  type,
  last = true,
}: NotificationProps) {
  return (
    <div
      className={cn("flex justify-between gap-x-2 py-3", last && "border-b")}
    >
      <div className="flex gap-x-2 items-center">
        <span className="flex justify-center items-center size-8 rounded-full p-1.5 border border-neutral-600">
          <FileCheck2Icon className="stroke-neutral-600" />
        </span>
        <div className="-space-y-1 flex flex-col">
          <Link href="/" className="text-blue font-semibold">
            {title}
          </Link>
          <p className="text-sm text-neutral-500">{content}</p>
        </div>
      </div>
      <div className="max-w-xs w-full flex justify-end">
        {type === "signal" ? (
          <span className="bg-red flex size-4 rounded-full"></span>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 max-w-lg w-full">
            <Button variant="primary" className="!h-9">
              Yes
            </Button>
            <Button variant="primary" className="bg-red !h-9">
              No
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
