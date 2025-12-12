import { getallByCompany } from "@/action/project.action";
import { dropdownMenu } from "@/app/(dashboard)/project/_components/table";
import TableActionButton from "@/app/(dashboard)/project/_components/table-action-button";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { formatNumber, getStatusName } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useSearchStore from "@/stores/search.store";
import { RequestResponse } from "@/types/api.types";
import { ProjectType } from "@/types/project.types";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function ProjectTab() {
  const id = useDataStore.use.currentCompany();
  const [projects, setProjects] = useState<ProjectType[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const search = useSearchStore.use.search();

  const [debouncedSearch] = useDebounce(search, 500);

  const { access: readAccess, loading } = useAccess("PROJECTS", "READ");

  const { mutate: mutateGetProjects, isPending: isGettingProjects } = useQueryAction<
    { companyId: string, search?: string, skip?: number; take?: number },
    RequestResponse<ProjectType[]>
  >(getallByCompany, () => { }, "projects");


  const refreshData = (searchValue?: string) => {
    if (id && readAccess) {
      mutateGetProjects({ companyId: id, search: searchValue, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setProjects(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  };


  useEffect(() => {
    refreshData();
  }, [id, readAccess, currentPage]);

  useEffect(() => {
    refreshData(debouncedSearch)
  }, [readAccess, id, debouncedSearch])

  return (
    <AccessContainer hasAccess={readAccess} resource="PROJECTS" loading={loading}>
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
        <div className="flex justify-end p-4">
          <Paginations
            totalItems={totalItems}
            pageSize={pageSize}
            controlledPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisiblePages={DEFAULT_PAGE_SIZE}
          />
        </div>
      </div>
    </AccessContainer>
  );
}
