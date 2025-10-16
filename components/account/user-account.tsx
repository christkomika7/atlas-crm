"use client";
import User from "./user";
import Link from "next/link";
import useQueryAction from "@/hook/useQueryAction";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { RequestResponse } from "@/types/api.types";
import { unique } from "@/action/user.action";
import { UserType } from "@/types/user.types";
import { useDataStore } from "@/stores/data.store";

export default function UserAccount() {
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
    <Link href={`/settings/profile/${data?.data?.id}`}>
      <User
        user={{
          image: data?.data?.image
            ? `/api/upload?path=${encodeURIComponent(data.data.image)}`
            : "",
          name: data?.data?.name ?? "",
        }}
      />
    </Link>
  );
}
