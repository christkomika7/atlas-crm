"use client";
import Link from "next/link";
import Circle from "../ui/circle";
import { NotificationIcon } from "../icons";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { checkNewNotifications } from "@/action/notification";
import { useEffect, useState } from "react";
import { useDataStore } from "@/stores/data.store";
import { Skeleton } from "../ui/skeleton";

export default function NotificationButton() {
  const path = usePathname();
  const companyId = useDataStore.use.currentCompany();
  const [notification, setNotification] = useState<{ hasUnread: boolean; count: number }>();

  const { mutate, isPending } = useQueryAction<
    { companyId: string },
    RequestResponse<{ hasUnread: boolean; count: number }>
  >(checkNewNotifications, () => { }, "alert");


  useEffect(() => {
    if (companyId) {
      mutate({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setNotification(data.data)
          }
        },
      })
    }
  }, [companyId])


  return (
    <>
      {isPending && !notification ? <Skeleton className="rounded-full w-[46px] h-[46px]" /> :
        <Link href="/notification">
          <Circle
            size={20}
            className={path === "/notification" && "bg-blue !border-blue"}
          >
            <span className="relative flex">
              {notification?.hasUnread &&
                <span
                  className={clsx(
                    "-top-0.5 -right-3.5 text-xs font-medium text-white justify-center px-1 items-center absolute flex bg-red border-2 rounded-full h-4 w-6 ",
                    path === "/notification" ? "border-blue" : "border-white",
                  )}
                >{notification.count > 9 ? '+9' : notification.count}</span>

              }
              <NotificationIcon
                className={path === "/notification" ? "fill-white" : ""}
              />
            </span>
          </Circle>
        </Link>
      }
    </>
  );
}
