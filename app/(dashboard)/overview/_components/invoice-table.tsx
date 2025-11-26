'use client';

import { getRecords } from "@/action/overview.action";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import useQueryAction from "@/hook/useQueryAction";
import { formatNumber } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { RecordType } from "@/types/overview.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type InvoiceTableProps = {
  canViewDashboard: boolean
}

export default function InvoiceTable({ canViewDashboard }: InvoiceTableProps) {
  const router = useRouter();
  const [records, setRecords] = useState<RecordType[]>([])
  const currency = useDataStore.use.currency();
  const companyId = useDataStore.use.currentCompany();

  const { mutate, isPending } = useQueryAction<
    { companyId: string },
    RequestResponse<RecordType[]>
  >(getRecords, () => { }, "records");

  useEffect(() => {
    if (companyId && canViewDashboard) {
      mutate({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setRecords(data.data);
          }
        },
      })
    }
  }, [companyId, canViewDashboard])

  function goto(id: string, type: string) {
    router.push(`/${type}/${id}`);
  }

  return (
    <div className="p-4 border border-neutral-200 gap-x-8 rounded-lg space-y-2">
      <h2 className="font-semibold">État des factures</h2>
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] text-center font-medium">#</TableHead>
            <TableHead className="font-medium text-center">Référence</TableHead>
            <TableHead className="font-medium text-center">Entreprise</TableHead>
            <TableHead className="font-medium text-center">
              Montant impayé
            </TableHead>
            <TableHead className="font-medium text-center">
              Montant payé
            </TableHead>
            <TableHead className="font-medium text-center">Status</TableHead>
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
          ) : records.length > 0 ? (
            records.map((record, index) => (
              <TableRow key={record.id} className="h-14">
                <TableCell className="text-neutral-600 text-center">
                  {index + 1}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {record.reference}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {record.company}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(record.amountUnpaid)} {currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(record.amountPaid)} {currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {record.status ?
                    <Badge className="w-[100px]" variant={record.status === "WAIT" ? "TODO" : record.status === "PENDING" ? "IN_PROGRESS" : "DONE"}>
                      {record.status === "WAIT" ? "En attente" : record.status === "PENDING" ? "En cour" : "VALIDER"}
                    </Badge> : "-"
                  }
                </TableCell>
                <TableCell className="text-center">
                  <button onClick={() => goto(record.id, record.type)} className="text-blue-600 cursor-pointer hover:underline">
                    Infos
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucune facture trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
