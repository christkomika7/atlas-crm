"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { all } from "@/action/client.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { ClientType } from "@/types/client.types";
import { dropdownMenu } from "./table";
import TableActionButton from "./table-action-button";
import { formatNumber } from "@/lib/utils";

type ClientsTableProps = {
  selectedClientIds: string[];
  setSelectedClientIds: Dispatch<SetStateAction<string[]>>;
};

export interface ClientsTableRef {
  refreshClients: () => void;
}

const ClientsTable = forwardRef<ClientsTableRef, ClientsTableProps>(
  ({ selectedClientIds, setSelectedClientIds }, ref) => {
    const id = useDataStore.use.currentCompany();

    const { mutate, isPending, data } = useQueryAction<
      { id: string },
      RequestResponse<ClientType[]>
    >(all, () => { }, "clients");

    const toggleSelection = (clientId: string, checked: boolean) => {
      setSelectedClientIds((prev) =>
        checked ? [...prev, clientId] : prev.filter((id) => id !== clientId)
      );
    };

    const refreshClients = () => {
      if (id) {
        mutate({ id });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshClients,
    }));

    useEffect(() => {
      refreshClients();
    }, [id]);

    const isSelected = (id: string) => selectedClientIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl w-full">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
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
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((client) => (
                <TableRow
                  key={client.id}
                  className={`h-16 transition-colors ${isSelected(client.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(client.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(client.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
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
      </div>
    );
  }
);

ClientsTable.displayName = "ClientsTable";

export default ClientsTable;
