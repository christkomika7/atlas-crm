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
import { formatNumber } from "@/lib/utils";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function ClientProjectPage() {
  const param = useParams();

  const { access: readAccess, loading } = useAccess("PROJECTS", "READ");

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<ProjectType>
  >(uniqueByClient, () => { }, "project");

  useEffect(() => {
    if (param.projectId && readAccess) {
      mutate({ id: param.projectId as string });
    }
  }, [param.projectId, readAccess]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-5 ">
        <div>
          <Header back={1} title="Informations du client" />
        </div>
      </div>
      <div className="w-full">
        {loading ? <Spinner /> :
          <AccessContainer hasAccess={readAccess} resource="PROJECTS">
            <>
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
                          {formatNumber(data?.data?.amount || 0)} {data?.data?.company.currency}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-h-0">
                    <TaskContainer projectId={data?.data?.id as string} />
                  </div>
                </>
              )}
            </>
          </AccessContainer>
        }
      </div>
    </div>
  );
}
