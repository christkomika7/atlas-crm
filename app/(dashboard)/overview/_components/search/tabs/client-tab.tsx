import { all } from "@/action/client.action";
import { dropdownMenu } from "@/app/(dashboard)/client/_components/table";
import TableActionButton from "@/app/(dashboard)/client/_components/table-action-button";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";
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
import { formatNumber } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useSearchStore from "@/stores/search.store";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function ClientTab() {
  const id = useDataStore.use.currentCompany();
  const [clients, setClients] = useState<ClientType[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const search = useSearchStore.use.search();
  const [debouncedSearch] = useDebounce(search, 500);

  const { access: readAccess, loading } = useAccess("CLIENTS", "READ");

  const { mutate, isPending } = useQueryAction<
    { id: string, search?: string, skip?: number; take?: number },
    RequestResponse<ClientType[]>
  >(all, () => { }, "clients");


  const refreshClients = (searchValue?: string) => {
    if (id && readAccess) {
      mutate({ id, search: searchValue, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setClients(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  };

  useEffect(() => {
    refreshClients();
  }, [id, readAccess, currentPage]);

  useEffect(() => {
    refreshClients(debouncedSearch)
  }, [readAccess, id, debouncedSearch])


  return (
    <AccessContainer hasAccess={readAccess} resource="CLIENTS" loading={loading} >
      <div className="border border-neutral-200 rounded-xl w-full">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Entreprise</TableHead>
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">
                Montant payé
              </TableHead>
              <TableHead className="font-medium text-center">
                Reste dû
              </TableHead>
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
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="h-16 transition-colors"                >
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {`${client.companyName}`}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {`${client.firstname} ${client.lastname}`}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(client.paidAmount)} {client.company?.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(client.due)} {client.company?.currency}                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={client.id}
                      refreshClients={refreshClients}
                      deleteTitle="Confirmer la suppression du client"
                      deleteMessage={
                        <p>
                          En supprimant ce client, toutes les informations liées
                          (<strong>factures, paiements, historiques</strong>)
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
                  Aucun client trouvé.
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
