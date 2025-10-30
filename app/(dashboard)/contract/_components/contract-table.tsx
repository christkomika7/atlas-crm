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
  useState,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { dropdownMenu } from "./table";
import { getAllContracts } from "@/action/contract.action";
import { $Enums } from "@/lib/generated/prisma";
import { ClientContractType, LessorContractType } from "@/types/contract-types";
import { formatDateToDashModel } from "@/lib/date";

type ContractTableProps = {
  filter: $Enums.ContractType;
  selectedContractIds: string[];
  setSelectedContractIds: Dispatch<SetStateAction<string[]>>;
};

export interface ContractTableRef {
  refreshContract: () => void;
}

const ContractTable = forwardRef<ContractTableRef, ContractTableProps>(
  ({ selectedContractIds, setSelectedContractIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();
    const [contracts, setContracts] = useState<ClientContractType[] | LessorContractType[]>([])

    const { mutate, isPending } = useQueryAction<
      { companyId: string; filter: $Enums.ContractType },
      RequestResponse<ClientContractType[] | LessorContractType[]>
    >(getAllContracts, () => { }, "contracts");

    const toggleSelection = (contractId: string, checked: boolean) => {
      setSelectedContractIds((prev) =>
        checked
          ? [...prev, contractId]
          : prev.filter((id) => id !== contractId)
      );
    };

    const refreshContract = () => {
      if (id) {
        mutate({ companyId: id, filter }, {
          onSuccess(data) {
            if (data.data) {
              setContracts(data.data);
            }
          },
        });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshContract,
    }));


    useEffect(() => {
      refreshContract();
    }, [id]);

    const isSelected = (id: string) => selectedContractIds.includes(id);

    function getUser(contract: ClientContractType | LessorContractType) {
      if (contract.type === "CLIENT") {
        const c = contract as ClientContractType;
        return `${c.client.lastname} ${c.client.firstname}`;
      } else {
        const c = contract as LessorContractType;
        if (c.lessor) {
          return `${c.lessor?.lastname} ${c.lessor?.firstname}`;
        } else {
          if (c.billboard.lessorSupplier) {
            return `${c.billboard.lessorSupplier?.lastname} ${c.billboard.lessorSupplier?.firstname}`
          }
          return `${c.billboard?.lessorName}`
        }
      }
    }

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Contrat</TableHead>
              <TableHead className="font-medium text-center">Client | Fournisseur</TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : contracts.length > 0 ? (
              contracts.map((contract: ClientContractType | LessorContractType) => (
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
                    {formatDateToDashModel(contract.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {contract.type === "CLIENT" ? "Client" : "Bailleur"}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {getUser(contract)}
                  </TableCell>

                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={contract.id}
                      refreshContract={refreshContract}
                      contract={contract.type}
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
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

ContractTable.displayName = "ContractTable";

export default ContractTable;
