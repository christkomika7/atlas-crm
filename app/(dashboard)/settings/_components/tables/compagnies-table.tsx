"use client";
import TableActionButton from "@/components/table/table-action-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dropdownMenu } from "./table";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { all } from "@/action/company.action";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import Spinner from "@/components/ui/spinner";
import { getCountryFrenchName } from "@/lib/helper";
import { UserType } from "@/types/user.types";
import { useEffect } from "react";
import { clearAllFiles } from "@/lib/file-storage";
import useCompanyStore from "@/stores/company.store";
import { useEmployeeStore } from "@/stores/employee.store";
import useTaxStore from "@/stores/tax.store";

export default function CompagniesTable() {
  const resetCompany = useCompanyStore.use.clearCompany();
  const resetEmployee = useEmployeeStore.use.resetEmployees();
  const resetTax = useTaxStore.use.clearTaxs();

  const query: UseQueryResult<
    RequestResponse<CompanyType<UserType>[]>,
    Error
  > = useQuery({
    queryKey: ["companies"],
    queryFn: () => all(),
  });

  useEffect(() => {
    resetCompany();
    resetEmployee();
    resetTax();
    clearAllFiles();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px] font-medium">
            Nom de l'entreprise
          </TableHead>
          <TableHead className="font-medium">Pays</TableHead>
          <TableHead className="font-medium">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.isLoading ? (
          <TableRow>
            <TableCell colSpan={3}>
              <div className="flex justify-center items-center py-6 w-full">
                <Spinner />
              </div>
            </TableCell>
          </TableRow>
        ) : query.data?.data?.length ? (
          query.data.data.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="text-neutral-600">
                {company.companyName}
              </TableCell>
              <TableCell className="text-neutral-600">
                {getCountryFrenchName(company.country)}
              </TableCell>
              <TableCell>
                <TableActionButton
                  menus={dropdownMenu}
                  id={company.id}
                  deleteTitle="Confirmer la suppression de l’entreprise"
                  deleteMessage={
                    <p>
                      En supprimant cette entreprise, toutes les données liées (
                      <strong>utilisateurs, profils, permissions, etc.</strong>)
                      seront également supprimées.
                      <br />
                      <span className="font-semibold text-red-600">
                        Cette action ne peut pas être annulée.
                      </span>
                      <br />
                      <br />
                      Souhaitez-vous vraiment procéder à cette suppression ?
                    </p>
                  }
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={3}
              className="py-6 text-gray-500 text-sm text-center"
            >
              Aucune entreprise trouvée.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
