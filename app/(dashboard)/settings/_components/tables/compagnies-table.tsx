"use client";

import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { all } from "@/action/company.action";
import Spinner from "@/components/ui/spinner";
import { getCountryFrenchName } from "@/lib/helper";
import useTaxStore from "@/stores/tax.store";
import Paginations from "@/components/paginations";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export default function CompagniesTable() {
  const resetTax = useTaxStore.use.clearTaxs();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  const skip = (currentPage - 1) * pageSize;

  const query = useQuery({
    queryKey: ["companies", currentPage, pageSize],
    queryFn: () => all(skip, pageSize),
  });

  useEffect(() => {
    resetTax();
  }, []);

  useEffect(() => {
    if (query.data) {
      setTotalItems(query.data.total || 0);
    }
  }, [query.data]);

  return (
    <div className="flex flex-col justify-between h-[calc(100vh-168px)]">
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
          ) : query.data?.data && query.data.data.length > 0 ? (
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
      <div className="flex">
        <Paginations
          totalItems={totalItems}
          pageSize={pageSize}
          controlledPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
