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
import { DataContractType } from "@/types/contract-types";
import { formatDateToDashModel } from "@/lib/date";
import Paginations from "@/components/paginations";
import { DEFAULT_PAGE_SIZE, INVOICE_PREFIX } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import { InvoiceType } from "@/types/invoice.types";
import { cutText, generateAmaId } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [totalItems, setTotalItems] = useState<number>(0);

    const skip = (currentPage - 1) * pageSize;

    const [contracts, setContracts] = useState<
      DataContractType[]
    >([]);

    const { access: readAccess, loading } = useAccess("CONTRACT", "READ");


    const { mutate, isPending } = useQueryAction<
      { companyId: string; filter: $Enums.ContractType; skip?: number; take?: number },
      RequestResponse<DataContractType[]>
    >(getAllContracts, () => { }, "contracts");

    const toggleSelection = (contractId: string, checked: boolean) => {
      setSelectedContractIds((prev) =>
        checked ? [...prev, contractId] : prev.filter((id) => id !== contractId)
      );
    };

    const refreshContract = () => {
      if (id && readAccess) {
        mutate(
          { companyId: id, filter, skip, take: pageSize },
          {
            onSuccess(data) {
              setContracts(data.data || []);
              setTotalItems(data.total ?? 0);
            },
          }
        );
      }
    };

    useImperativeHandle(ref, () => ({
      refreshContract,
    }));

    useEffect(() => {
      refreshContract();
    }, [id, filter, currentPage, readAccess]);

    const isSelected = (id: string) => selectedContractIds.includes(id);

    function getUser(contract: DataContractType) {
      if (contract.type === "CLIENT") {
        const c = contract;
        return `${c.client.companyName}`;
      } else {
        const c = contract;
        if (c.lessor) {
          return `${c.lessor?.companyName}`;
        } else {
          if (c.billboard.lessorSupplier) {
            return `${c.billboard.lessorName}`;
          }
          return `${c.billboard?.lessorName}`;
        }
      }
    }

    function getInvoices(invoices: InvoiceType[] | undefined, prefix: string): string {
      if (!invoices || invoices.length === 0) return "-";
      const references = invoices.map(invoice => `${prefix}-${generateAmaId(invoice.invoiceNumber, false)}`)
      return references.join("; ")
    }

    function getProjects(invoices: InvoiceType[] | undefined) {
      if (!invoices || invoices.length === 0) return "-";
      const projects = invoices.map(invoice => `${invoice.project.name}`)
      return projects.join("; ");

    }

    if (loading) return <Spinner />

    return (
      <AccessContainer hasAccess={readAccess} resource="CONTRACT" >
        <div className="border border-neutral-200 rounded-xl flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="min-w-[50px] font-medium" />
                <TableHead className="font-medium text-center">Date</TableHead>
                <TableHead className="font-medium text-center">Facture(s)</TableHead>
                <TableHead className="font-medium text-center">Projet</TableHead>
                <TableHead className="font-medium text-center">
                  Société
                </TableHead>
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
                contracts.map((contract: DataContractType) => (
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
                      {!contract.invoices || contract.invoices.length === 0 ? "-" :
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {cutText(getInvoices(contract.invoices, contract.company.documentModel.invoicesPrefix || INVOICE_PREFIX), 20)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {getInvoices(contract.invoices, contract.company.documentModel.invoicesPrefix || INVOICE_PREFIX)}
                          </TooltipContent>
                        </Tooltip>
                      }
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {!contract.invoices || contract.invoices.length === 0 ? "-" :
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              {cutText(getProjects(contract.invoices), 20)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            {getProjects(contract.invoices)}
                          </TooltipContent>
                        </Tooltip>
                      }
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {getUser(contract)}
                    </TableCell>

                    <TableCell className="text-center">
                      <TableActionButton
                        menus={dropdownMenu}
                        id={contract.id}
                        refreshContract={refreshContract}
                        contract={filter}
                        deleteTitle="Confirmer la suppression du contrat"
                        deleteMessage={
                          <p>
                            En supprimant le contrat, toutes les informations liées
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
                    colSpan={9}
                    className="py-6 text-gray-500 text-sm text-center"
                  >
                    Aucun contrat trouvé.
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
);

ContractTable.displayName = "ContractTable";

export default ContractTable;
