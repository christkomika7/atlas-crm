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
import { all } from "@/action/supplier.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { SupplierType } from "@/types/supplier.types";
import { dropdownMenu } from "./table";
import TableActionButton from "./table-action-button";
import { paymentTerms } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

type SuppliersTableProps = {
  selectedSupplierIds: string[];
  setSelectedSupplierIds: Dispatch<SetStateAction<string[]>>;
};

export interface SuppliersTableRef {
  refreshSuppliers: () => void;
}

const SuppliersTable = forwardRef<SuppliersTableRef, SuppliersTableProps>(
  ({ selectedSupplierIds, setSelectedSupplierIds }, ref) => {
    const id = useDataStore.use.currentCompany();

    const { mutate, isPending, data } = useQueryAction<
      { id: string },
      RequestResponse<SupplierType[]>
    >(all, () => {}, "suppliers");

    const toggleSelection = (supplierId: string, checked: boolean) => {
      setSelectedSupplierIds((prev) =>
        checked ? [...prev, supplierId] : prev.filter((id) => id !== supplierId)
      );
    };

    const refreshSuppliers = () => {
      if (id) {
        mutate({ id });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshSuppliers,
    }));

    useEffect(() => {
      refreshSuppliers();
    }, [id]);

    const isSelected = (id: string) => selectedSupplierIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl w-full">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Société</TableHead>
              <TableHead className="font-medium text-center">Nom</TableHead>
              <TableHead className="font-medium text-center">
                Montant payé
              </TableHead>
              <TableHead className="font-medium text-center">
                Reste dû
              </TableHead>
              <TableHead className="font-medium text-center">
                Conditions de paiement
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
              data.data.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className={`h-16 transition-colors ${
                    isSelected(supplier.id) ? "bg-neutral-100" : ""
                  }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(supplier.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(supplier.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {supplier.companyName}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {`${supplier.firstname} ${supplier.lastname}`}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(supplier.paidAmount)}{" "}
                    {supplier.company?.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(supplier.due)} {supplier.company?.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {
                      paymentTerms.find(
                        (p) => p.value === supplier.paymentTerms
                      )?.label
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={supplier.id}
                      refreshSuppliers={refreshSuppliers}
                      deleteTitle="Confirmer la suppression du fournisseur"
                      deleteMessage={
                        <p>
                          En supprimant ce fournisseur, toutes les informations
                          liées (
                          <strong>factures, paiements, historiques</strong>)
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
                  Aucun fournisseur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

SuppliersTable.displayName = "SuppliersTable";

export default SuppliersTable;
