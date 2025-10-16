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
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { all } from "@/action/supplier.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { SupplierType } from "@/types/supplier.types";

type ProjectTableProps = {
  //   selectedSupplierIds: string[];
  //   setSelectedSupplierIds: Dispatch<SetStateAction<string[]>>;
};

export interface ProjectTableRef {
  //   refreshSuppliers: () => void;
}

const ProjectTable = forwardRef<ProjectTableRef, ProjectTableProps>(
  (
    {
      // selectedSupplierIds, setSelectedSupplierIds
    },
    ref
  ) => {
    // const id = useDataStore.use.currentCompany();

    // const { mutate, isPending, data } = useQueryAction<
    //   { id: string },
    //   RequestResponse<SupplierType[]>
    // >(all, () => {}, "suppliers");

    // const toggleSelection = (supplierId: string, checked: boolean) => {
    //   setSelectedSupplierIds((prev) =>
    //     checked ? [...prev, supplierId] : prev.filter((id) => id !== supplierId)
    //   );
    // };

    // const refreshSuppliers = () => {
    //   if (id) {
    //     mutate({ id });
    //   }
    // };

    // Exposer la méthode refreshSuppliers via la ref
    // useImperativeHandle(ref, () => ({
    //   refreshSuppliers,
    // }));

    // useEffect(() => {
    //   refreshSuppliers();
    // }, [id]);

    // const isSelected = (id: string) => selectedSupplierIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium text-center">
                Sélection
              </TableHead>
              <TableHead className="min-w-[50px] font-medium text-center">
                PO N°
              </TableHead>
              <TableHead className="font-medium text-center">Projet</TableHead>
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
            <TableRow>
              <TableCell className="text-neutral-600">
                <div className="flex justify-center items-center">
                  <Checkbox />
                </div>
              </TableCell>
              <TableCell className="text-neutral-600 text-center">
                AC-45678
              </TableCell>
              <TableCell className="text-neutral-600 text-center">
                Jacob Marcus
              </TableCell>
              <TableCell className="text-neutral-600 text-center">
                $800
              </TableCell>
              <TableCell className="text-neutral-600 text-center">
                $800
              </TableCell>
              <TableCell className="text-neutral-600 text-center">
                45 days
              </TableCell>
              <TableCell className="text-neutral-600 text-center">X</TableCell>
            </TableRow>
            {/* {isPending ? (
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
                    {new Date(supplier.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {`${supplier.firstname} ${supplier.lastname}`}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    0 {supplier.company?.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    0 {supplier.company?.currency}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={supplier.id}
                      refreshSuppliers={refreshSuppliers}
                      deleteTitle="Confirmer la suppression du fournisseur"
                      deleteMessage={
                        <p>
                          En supprimant ce fournisseur, toutes les informations liées
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
                  Aucun fournisseur trouvé.
                </TableCell>
              </TableRow>
            )} */}
          </TableBody>
        </Table>
      </div>
    );
  }
);

ProjectTable.displayName = "ProjectTable";

export default ProjectTable;
