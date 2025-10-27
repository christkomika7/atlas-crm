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
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { AppointmentType } from "@/types/appointment.type";
import { all } from "@/action/appointment.action";
import { dropdownMenu } from "./table";
import { cutText } from "@/lib/utils";

type ContractTableProps = {
  filter: "client" | "lessor";
  selectedContractIds: string[];
  setSelectedContractIds: Dispatch<SetStateAction<string[]>>;
};

export interface ContractTableRef {
  refreshContract: () => void;
}

const ContractTable = forwardRef<ContractTableRef, ContractTableProps>(
  ({ selectedContractIds, setSelectedContractIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();

    // const { mutate, isPending, data } = useQueryAction<
    //   { companyId: string; filter: "client" | "lessor" },
    //   RequestResponse<AppointmentType[]>
    // >(all, () => { }, "contract");

    const toggleSelection = (contractId: string, checked: boolean) => {
      setSelectedContractIds((prev) =>
        checked
          ? [...prev, contractId]
          : prev.filter((id) => id !== contractId)
      );
    };

    // const refreshContract = () => {
    //   if (id) {
    //     mutate({ companyId: id, filter });
    //   }
    // };

    // useImperativeHandle(ref, () => ({
    //   refreshContract,
    // }));

    // useEffect(() => {
    //   refreshContract();
    // }, [id]);

    const isSelected = (id: string) => selectedContractIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Email</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Heure</TableHead>
              <TableHead className="font-medium text-center">Adresse</TableHead>
              <TableHead className="font-medium text-center">
                Objet de la réunion
              </TableHead>
              <TableHead className="font-medium text-center">
                Membre de l'équipe
              </TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {isPending ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((contract) => (
                <TableRow
                  key={contract.id}
                  className={`h-16 transition-colors ${isSelected(contract.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(contract.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(contract.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.client.firstname} {contract.client.lastname}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.email}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(contract.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.time}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.address}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(contract.subject, 20)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.teamMemberName}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={contract.id}
                      refreshClients={refreshContract}
                      deleteTitle="Confirmer la suppression du contrat"
                      deleteMessage={
                        <p>
                          En supprimant le contrat, toutes les
                          informations liées seront également supprimées.
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
                  colSpan={9}
                  className="py-6 text-gray-500 text-sm text-center"
                >
                  Aucun contrat trouvé.
                </TableCell>
              </TableRow>
            )} */}
          </TableBody>
        </Table>
      </div>
    );
  }
);

ContractTable.displayName = "ContractTable";

export default ContractTable;
