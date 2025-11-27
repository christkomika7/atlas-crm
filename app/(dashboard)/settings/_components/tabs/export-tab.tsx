"use client";
import { Combobox } from "@/components/ui/combobox";
import { periods, reportTypes } from "@/lib/data";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { filterDatas } from "@/action/company.action";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";

import useQueryAction from "@/hook/useQueryAction";
import { FilterDataType } from "@/types/company.types";
import Spinner from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateToDashModel } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import SalesByClientChart from "../chart/sales-by-client-chart";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function ExportTab() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency()
  const [filters, setFilters] = useState<{
    reportType: string,
    period: string,
    start?: Date,
    end?: Date
  }>({
    reportType: "salesByClient",
    period: "",
    start: undefined,
    end: undefined
  });
  const [datas, setDatas] = useState<FilterDataType[]>([]);

  const { access: readAccess, loading } = useAccess("SETTING", "READ")

  const { mutate: mutateGetDatas, isPending: isGettingDatas } = useQueryAction<
    { companyId: string, reportType?: string, period?: string, start?: Date, end?: Date },
    RequestResponse<FilterDataType[]>
  >(filterDatas, () => { }, "datas");

  useEffect(() => {
    if (companyId && readAccess) {
      mutateGetDatas({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setDatas(data.data)
          }
        },
      });
    }

  }, [companyId, readAccess])

  useEffect(() => {
    if (readAccess) {
      const { reportType, period, start, end } = filters;
      mutateGetDatas({ companyId, reportType, period, start, end }, {
        onSuccess(data) {
          if (data.data) {
            setDatas(data.data)
          }
        },
      });
    }
  }, [filters, readAccess])

  return (
    <AccessContainer hasAccess={readAccess} resource="SETTING">
      <div className="space-y-4 pt-4">
        <div className="flex gap-x-2 justify-between items-center">
          <div className="grid grid-cols-[300px_220px_160px_160px] gap-x-2 max-w-3xl w-full">
            <Combobox
              datas={reportTypes}
              value={filters.reportType}

              setValue={(e) => setFilters({ ...filters, reportType: String(e) })}
              placeholder="Type de rapport"
              searchMessage="Rechercher un type de rapport"
              noResultsMessage="Aucun type de rapport trouvé."
            />
            <Combobox
              required={false}
              datas={periods}
              value={filters.period}
              setValue={(e) => setFilters({ ...filters, period: String(e) })}
              placeholder="Période"
              searchMessage="Rechercher une période"
              noResultsMessage="Aucune période trouvée."
            />
            <DatePicker
              label="Date de début"
              required={false}
              mode="single"
              value={filters.start || undefined}
              disabled={false}
              onChange={(date) => setFilters({ ...filters, start: date as Date })}
            />
            <DatePicker
              required={false}
              label="Date de fin"
              mode="single"
              value={filters.end || undefined}
              disabled={false}
              onChange={(date) => setFilters({ ...filters, end: date as Date })}
            />
          </div>
          <Button variant="inset-primary" className="max-w-[120px] !h-11" >Exporter</Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-semibold">Ventes par clients</h2>
          </div>
          {isGettingDatas ? <Spinner /> :
            <SalesByClientChart />
          }
          <div className="border border-neutral-200 px-4 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="h-14">

                  <TableHead className="font-medium text-center">
                    Date
                  </TableHead>
                  <TableHead className="font-medium text-center">Client</TableHead>
                  <TableHead className="font-medium text-center">Nombre de facture</TableHead>
                  <TableHead className="font-medium text-center">Montant généré</TableHead>
                  <TableHead className="font-medium text-center">Total payé</TableHead>
                  <TableHead className="font-medium text-center">Due</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>

                {isGettingDatas ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex justify-center items-center py-6 w-full">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : datas.length > 0 ? (
                  datas.map((data) => (
                    <TableRow key={data.id} className="h-12">
                      <TableCell className="text-center">{formatDateToDashModel(data.date)}</TableCell>
                      <TableCell className="text-center">
                        {data.name}
                      </TableCell>
                      <TableCell className="text-center">{data.count}</TableCell>
                      <TableCell className="text-center">{formatNumber(data.totalGenerated)} {currency}</TableCell>
                      <TableCell className="text-center">{formatNumber(data.totalPaid)} {currency}</TableCell>
                      <TableCell className="text-center">{formatNumber(data.totalRemaining)} {currency}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-gray-500 text-sm text-center"
                    >
                      Aucune donnée trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AccessContainer>
  );
}
