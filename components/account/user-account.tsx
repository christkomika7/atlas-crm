"use client";
import User from "./user";
import Link from "next/link";
import useQueryAction from "@/hook/useQueryAction";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { RequestResponse } from "@/types/api.types";
import { getUserByCurrentCompany } from "@/action/user.action";
import { useDataStore } from "@/stores/data.store";
import { ProfileType } from "@/types/user.types";
import { resolveImageSrc, urlToFile } from "@/lib/utils";

export default function UserAccount() {
  const userId = useDataStore.use.id();
  const companyId = useDataStore.use.currentCompany();
  const [profile, setProfile] = useState<ProfileType>();

  const [image, setImage] = useState("");

  const { mutate, isPending, data } = useQueryAction<
    { companyId: string, userId: string },
    RequestResponse<ProfileType>
  >(getUserByCurrentCompany, () => { }, "user");

  useEffect(() => {
    if (userId) {
      mutate({ userId, companyId }, {
        onSuccess(data) {
          if (data.data) {
            setProfile(data.data);
          }
        },
      });
    }
  }, [userId]);


  useEffect(() => {
    getProfil()
  }, [profile])


  async function getProfil() {
    if (profile?.image) {
      const file = await urlToFile(profile.image);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setImage(resolveImage)
      }
    }
  }


  if (isPending && data) {
    return <Skeleton className="rounded-full w-[46px] h-[46px]" />;
  }
  return (
    <Link href={`/overview/profile/${profile?.id}`}>
      <User
        user={{
          image: image,
          name: profile?.user?.name ? profile.user.name : profile?.firstname && profile.lastname ? `${profile?.firstname} ${profile?.lastname}` : "-",
        }}
      />
    </Link>
  );
}
