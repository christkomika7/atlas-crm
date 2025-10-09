"use client";
import Link from "next/link";
import Circle from "../ui/circle";
import { NotificationIcon } from "../icons";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function NotificationButton() {
  const path = usePathname();
  return (
    <Link href="/notification">
      <Circle
        size={20}
        className={path === "/notification" && "bg-blue !border-blue"}
      >
        <span className="relative flex">
          <span
            className={clsx(
              "top-[1px] -right-[1px] absolute flex bg-red border-2 rounded-full w-2.5 h-2.5",
              path === "/notification" ? "border-blue" : "border-white"
            )}
          />
          <NotificationIcon
            className={path === "/notification" ? "fill-white" : ""}
          />
        </span>
      </Circle>
    </Link>
  );
}
