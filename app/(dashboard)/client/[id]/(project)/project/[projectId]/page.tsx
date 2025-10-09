"use client";
import Header from "@/components/header/header";
import { useEffect } from "react";
import TaskContainer from "../_components/task-container";
import { useParams } from "next/navigation";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ProjectType } from "@/types/project.types";
import { uniqueByClient } from "@/action/project.action";
import Spinner from "@/components/ui/spinner";

export default function ClientProjectPage() {
  const param = useParams();
  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<ProjectType>
  >(uniqueByClient, () => {}, "project");

  useEffect(() => {
    if (param.projectId) {
      mutate({ id: param.projectId as string });
    }
  }, [param.projectId]);

  return (
    <div className="flex flex-col h-full">
      {/* En-tête fixe */}
      <div className="flex-shrink-0 mb-5 ">
        <div>
          <Header back={1} title="Informations du client" />
        </div>
      </div>
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <div className="flex mb-5 justify-between items-center gap-x-2 px-6">
            {isPending ? (
              <Spinner />
            ) : (
              <h2 className="flex-shrink-0 font-semibold text-xl">
                {data?.data?.company.companyName}
              </h2>
            )}
            <div className="flex items-center gap-x-2 mr-4">
              <p className="font-semibold text-lg">Solde:</p>
              {isPending ? (
                <Spinner />
              ) : (
                <p className="text-sm">
                  {data?.data?.client.paidAmount} {data?.data?.company.currency}
                </p>
              )}
            </div>
          </div>

          {/* Container qui prend tout l'espace restant */}
          <div className="flex-1 min-h-0">
            <TaskContainer projectId={data?.data?.id as string} />
          </div>
        </>
      )}
    </div>
  );
}
