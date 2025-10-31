"use client";

import { allByClient } from "@/action/project.action";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ProjectType } from "@/types/project.types";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import TableActionButton from "../table-action-button";
import { dropdownMenu } from "../table";
import { Badge } from "@/components/ui/badge";
import { formatNumber, getStatusName } from "@/lib/utils";

export default function ProjectTable() {
  const params = useParams();

  const { mutate, isPending, data } = useQueryAction<
    { clientId: string },
    RequestResponse<ProjectType[]>
  >(allByClient, () => { }, "projects");

  useEffect(() => {
    if (params.id) {
      mutate({ clientId: params.id as string });
    }
  }, [params.id]);

  function refreshProjects() {
    if (params.id) {
      mutate({ clientId: params.id as string });
    }
  }

  return (
    <div className="border border-neutral-200 rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="font-medium text-center">
              Nom du projet
            </TableHead>
            <TableHead className="font-medium text-center">
              Date d’ouverture
            </TableHead>
            <TableHead className="font-medium text-center">Montant</TableHead>
            <TableHead className="font-medium text-center">Solde</TableHead>
            <TableHead className="font-medium text-center">Statut</TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : data?.data && data.data.length > 0 ? (
            data.data.map((project) => (
              <TableRow key={project.id} className="h-14">
                <TableCell className="text-neutral-600 text-center">
                  {project.name}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {new Date(project.deadline).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(project.amount)} {project.company?.currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(project.balance)} {project.company?.currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  <Badge variant={project.status}>
                    {getStatusName(project.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <TableActionButton
                    menus={dropdownMenu}
                    id={project.id}
                    deleteTitle="Confirmer la suppression du projet"
                    refreshProjects={refreshProjects}
                    deleteMessage={
                      <p>
                        En supprimant ce projet, toutes les informations liées
                        seront également supprimées.
                        <br />
                        <span className="font-semibold text-red-600">
                          Cette action est irréversible.
                        </span>
                        <br />
                        <br />
                        Confirmez-vous cette suppression ?
                      </p>
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucun projet trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
