"use client";

import { Button } from "@/components/ui/button";
import { Edit3Icon, EditIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { UserType } from "@/types/user.types";
import { useParams } from "next/navigation";
import { RequestResponse } from "@/types/api.types";
import {
  editOther,
  editPassport,
  editProfil,
  unique,
} from "@/action/user.action";
import { UserProfilSchema } from "@/lib/zod/user.schema";
import { useEffect, useState } from "react";

import EmployeeList from "../../employee/_components/employee-list";
import Link from "next/link";
import ProfileInput from "@/components/ui/profile-input";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import LogoutButton from "@/components/logout-button";
import EmployeeDocuments from "../../employee/_components/employee-documents";
import { getSession } from "@/lib/auth-client";
import { generateAmaId } from "@/lib/utils";

export default function EmployeeInfo() {
  const param = useParams();
  const sessionData = getSession();
  const [profil, setProfil] = useState<File | null>(null);

  const {
    mutate: mutateEmployee,
    isPending: isLoadingEmployee,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<UserType>>(
    unique,
    () => {},
    "employee"
  );

  const {
    mutate: mutateEmployeeProfil,
    isPending: isLoadingEmployeeProfil,
    data: profileData,
  } = useQueryAction<UserProfilSchema, RequestResponse<UserType>>(
    editProfil,
    () => {},
    "employee"
  );

  useEffect(() => {
    if (param.id) {
      mutateEmployee({ id: param.id as string });
    }
  }, [param.id]);

  function handleProfil(e: React.MouseEvent<HTMLLabelElement, MouseEvent>) {
    e.preventDefault();
    if (param.id) {
      mutateEmployeeProfil({
        id: param.id as string,
        image: profil ?? undefined,
      });
    }
  }

  if (isLoadingEmployee || !data?.data) {
    return <Spinner />;
  }
  return (
    <div className="h-full">
      <ScrollArea className="pr-4 h-full">
        <div className="p-3.5 border border-neutral-100 rounded-xl">
          <div className="flex items-center">
            {(isLoadingEmployee || isLoadingEmployeeProfil) && <Spinner />}
            <div className="flex flex-1 justify-end gap-x-2">
              {sessionData.data?.user?.role === "ADMIN" && (
                <Link href={`/settings/profile/${data.data.id}/edit`}>
                  <Button variant="primary" className="rounded-lg w-fit !h-10">
                    <EditIcon className="size-4" />
                    Modifier
                  </Button>
                </Link>
              )}
              <LogoutButton />
            </div>
          </div>
          <div className="max-w-xl">
            <EmployeeList value="Commission : 200$">
              <div className="w-28 h-28">
                <ProfileInput
                  initialImage={
                    profileData?.data?.image
                      ? `/api/upload?path=${profileData.data.image}`
                      : data.data.image
                      ? `/api/upload?path=${data.data.image}`
                      : undefined
                  }
                  onChange={setProfil}
                  label={
                    <Label
                      onClick={handleProfil}
                      htmlFor="profile"
                      className="right-2 bottom-2 z-20 absolute flex justify-center items-center cursor-pointer"
                    >
                      <span className="flex justify-center items-center bg-white shadow-slate-400/30 shadow-sm rounded-full size-5.5">
                        <Edit3Icon className="size-3" />
                      </span>
                    </Label>
                  }
                />
              </div>
            </EmployeeList>

            <EmployeeList value={data.data?.profile.firstname}>
              <>Prénom</>
            </EmployeeList>
            <EmployeeList value={data.data?.profile.lastname}>
              <>Nom</>
            </EmployeeList>
            <EmployeeList value={generateAmaId(data.data.key)}>
              <>Identifiant</>
            </EmployeeList>
            <EmployeeList value={data.data?.email}>
              <>Adresse mail</>
            </EmployeeList>
            <EmployeeList value={data.data?.profile.job}>
              <>Emploi</>
            </EmployeeList>
            <EmployeeList value={data.data?.profile.salary}>
              <>Salaire</>
            </EmployeeList>
            <EmployeeDocuments initialUser={data.data} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
