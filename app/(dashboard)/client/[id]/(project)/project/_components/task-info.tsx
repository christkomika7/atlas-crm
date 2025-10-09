"use client";

import { unique } from "@/action/task.action";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { TaskType } from "@/types/task.type";
import { Dispatch, SetStateAction, useEffect } from "react";
import ShowValue from "./show-value";
import { priority, status } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadFile } from "@/lib/utils";
import { DownloadIcon } from "lucide-react";

type TaskInfoProps = {
  id: string;
  closeModal: Dispatch<SetStateAction<boolean>>;
};

export default function TaskInfo({ id, closeModal }: TaskInfoProps) {
  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<TaskType>
  >(unique, () => {}, "task");

  useEffect(() => {
    if (id) {
      mutate({ id });
    }
  }, [id]);

  return (
    <>
      {isPending && !data && (
        <Badge variant="secondary" className="text-sm">
          Chargement des données <Spinner size={12} />
        </Badge>
      )}
      <div className="gap-x-3 grid grid-cols-2">
        <div className="space-y-2">
          <ShowValue
            title="Nom de la tâche"
            value={data?.data?.taskName as string}
          />

          <div className="gap-x-2 grid grid-cols-3">
            {data?.data && (
              <ShowValue
                title="Délai"
                value={new Date(data!.data!.time).toLocaleDateString() || "-"}
              />
            )}
            <ShowValue
              title="Priorité"
              value={
                priority.find((s) => s.value === data?.data?.priority)?.label ||
                "Aucune"
              }
            />

            <ShowValue
              title="Statut"
              value={
                status.find((s) => s.value === data?.data?.status)?.label ||
                "Aucun"
              }
            />
          </div>

          <div className="space-y-0.5">
            <h2 className="font-semibold text-sm">
              Liste des fichiers enregistrés
            </h2>
            <ScrollArea className="bg-gray p-2 border rounded-md h-[150px]">
              <ul className="w-full text-sm">
                {data?.data && data.data.file.length > 0 ? (
                  data.data.file.map((document, index) => {
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center hover:bg-white/50 px-2 py-1 rounded"
                      >
                        {index + 1}. {document.split("/").pop()}{" "}
                        <span className="flex items-center gap-x-2">
                          <span
                            onClick={() => downloadFile(document)}
                            className="text-blue cursor-pointer"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </span>{" "}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm">Aucun document trouvé.</li>
                )}
              </ul>
            </ScrollArea>
          </div>
        </div>
        <div className="space-y-2">
          <ShowValue title="Description" value={data?.data?.desc || "Aucune"} />
          <ShowValue
            title="Commentaire"
            value={data?.data?.comment || "Aucune"}
          />
          <div className="space-y-0.5">
            <h2 className="font-semibold text-sm">
              Liste des personnes assignées
            </h2>
            <ScrollArea className="bg-gray p-2 border rounded-md h-[150px]">
              <ul className="w-full text-sm">
                {data?.data && data.data.users.length > 0 ? (
                  data.data.users.map((user, index) => {
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center hover:bg-white/50 px-2 py-1 rounded"
                      >
                        {index + 1}. {user.name}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm">Aucune personne trouvée.</li>
                )}
              </ul>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}
