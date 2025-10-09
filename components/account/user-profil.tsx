"use client";
import { Edit3Icon } from "lucide-react";
import React, { useEffect } from "react";
import User from "./user";
import { Skeleton } from "../ui/skeleton";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { unique } from "@/action/user.action";
import { UserType } from "@/types/user.types";
import { useDataStore } from "@/stores/data.store";

export default function UserProfil() {
  const id = useDataStore.use.id();

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<UserType>
  >(unique, () => {}, "employee");

  useEffect(() => {
    if (id) {
      mutate({ id });
    }
  }, [id]);

  if (isPending && data) {
    return <Skeleton className="rounded-full w-[46px] h-[46px]" />;
  }
  return (
    <div className="flex items-center gap-x-3">
      <div className="relative">
        <span className="-right-1 bottom-0 z-20 absolute flex justify-center items-center bg-white shadow-xs rounded-full size-5.5">
          <Edit3Icon className="size-3.5" />
        </span>
        <User
          size={60}
          user={{
            image: data?.data?.image
              ? `/api/upload?path=${encodeURIComponent(data.data.image)}`
              : "",
            name: data?.data?.name ?? "",
          }}
        />
      </div>
      <div className="-space-y-0.5">
        <h2 className="font-medium">{data?.data?.name}</h2>
        <p className="text-neutral-600">{data?.data?.name}</p>
      </div>
    </div>
  );
}
