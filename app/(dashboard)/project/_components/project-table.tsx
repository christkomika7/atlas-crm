"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { dropdownMenu } from "./table";
import { formatNumber, getStatusName } from "@/lib/utils";
import { getallByCompany } from "@/action/project.action";
import { ProjectType } from "@/types/project.types";
import { Badge } from "@/components/ui/badge";
import { useAccess } from "@/hook/useAccess";
import { Checkbox } from "@/components/ui/checkbox";
import AccessContainer from "@/components/errors/access-container";

type ProjectTableProps = {
  filter: "stop" | "loading";
  selectedProjectIds: string[];
  setSelectedProjectIds: Dispatch<SetStateAction<string[]>>;
};

export interface ProjectTableRef {
  refreshData: () => void;
}

const ProjectTable = forwardRef<ProjectTableRef, ProjectTableProps>(
  ({ selectedProjectIds, setSelectedProjectIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();
    const [projects, setProjects] = useState<ProjectType[]>([]);

    const { access: readAccess, loading } = useAccess("PROJECTS", "READ");

    const { mutate: mutateGetProjects, isPending: isGettingProjects } = useQueryAction<
      { companyId: string, projectStatus: "stop" | "loading" },
      RequestResponse<ProjectType[]>
    >(getallByCompany, () => { }, "projects");


    const toggleSelection = (projectId: string, checked: boolean) => {
      setSelectedProjectIds((prev) =>
        checked
          ? [...prev, projectId]
          : prev.filter((id) => id !== projectId)
      );
    };

    const refreshData = () => {
      if (id && readAccess) {
        mutateGetProjects({ companyId: id, projectStatus: filter }, {
          onSuccess(data) {
            if (data.data) {
              setProjects(data.data);
            }
          },
        });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshData,
    }));

    useEffect(() => {
      refreshData();
    }, [id, readAccess]);

    const isSelected = (id: string) => selectedProjectIds.includes(id);

    if (loading) return <Spinner />

    return (
      <AccessContainer hasAccess={readAccess} resource="PROJECTS">
        <div className="border border-neutral-200 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="min-w-[50px] font-medium" />
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
              {isGettingProjects ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex justify-center items-center py-6 w-full">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id} className="h-14">
                    <TableCell className="text-neutral-600">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={isSelected(project.id)}
                          onCheckedChange={(checked) =>
                            toggleSelection(project.id, !!checked)
                          }
                        />
                      </div>
                    </TableCell>
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
                        refreshData={refreshData}
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
      </AccessContainer>
    );
  }
);

ProjectTable.displayName = "ProjectTable";

export default ProjectTable;
