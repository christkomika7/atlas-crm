"use client";

import EmployeeCard from "./employee-card";
import AddEmployee from "./add-employee";
import useQueryAction from "@/hook/useQueryAction";
import { useEffect, useState } from "react";
import { ProfileType } from "@/types/user.types";
import { RequestResponse } from "@/types/api.types";
import { getUsersByCompany } from "@/action/user.action";
import { useParams } from "next/navigation";
import Spinner from "@/components/ui/spinner";

export default function EmployeePanel() {
  const param = useParams();
  const [profiles, setProfiles] = useState<ProfileType[]>([])

  const { mutate, isPending } = useQueryAction<
    { companyId: string },
    RequestResponse<ProfileType[]>
  >(getUsersByCompany, () => { }, "users");

  function getUsers() {
    if (param.id) {
      mutate({ companyId: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setProfiles(data.data);
          }
        }
      });
    }
  }

  useEffect(() => {
    getUsers();
  }, [param])


  return (
    <div className="flex flex-wrap items-center gap-6">
      {isPending ? <Spinner /> :
        <>
          {profiles.map((profile) => (
            <EmployeeCard
              key={profile.id}
              profile={profile}
              refresh={getUsers}
            />
          ))}
        </>
      }
      <AddEmployee companyId={param.id as string} />
    </div>
  );
}
