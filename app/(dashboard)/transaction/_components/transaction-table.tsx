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
import { BillboardType } from "@/types/billboard.types";
import { all } from "@/action/billboard.action";
import { cn, formatNumber } from "@/lib/utils";
import { dropdownMenu } from "./table";
import TableActionButton from "./table-action-button";

type TransactionTableProps = {
  selectedTransactionIds: string[];
  setSelectedTransactionIds: Dispatch<SetStateAction<string[]>>;
};

export interface TransactionTableRef {
  refreshTransaction: () => void;
}

const TransactionTable = forwardRef<TransactionTableRef, TransactionTableProps>(
  ({ selectedTransactionIds, setSelectedTransactionIds }, ref) => {
    const companyId = useDataStore.use.currentCompany();

    const { mutate, isPending, data } = useQueryAction<
      { companyId: string },
      RequestResponse<BillboardType[]>
    >(all, () => {}, "billboard");

    const toggleSelection = (transactionId: string, checked: boolean) => {
      setSelectedTransactionIds((prev) =>
        checked
          ? [...prev, transactionId]
          : prev.filter((id) => id !== transactionId)
      );
    };

    const refreshTransaction = () => {
      if (companyId) {
        console.log({ companyId });
        mutate({ companyId });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshTransaction,
    }));

    useEffect(() => {
      refreshTransaction();
    }, [companyId]);

    const isSelected = (id: string) => selectedTransactionIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">
                Mouvement
              </TableHead>
              <TableHead className="font-medium text-center">
                Catégorie
              </TableHead>
              <TableHead className="font-medium text-center">Nature</TableHead>
              <TableHead className="font-medium text-center">
                Description
              </TableHead>
              <TableHead className="font-medium text-center">
                HT Montant
              </TableHead>
              <TableHead className="font-medium text-center">
                TTC Montant
              </TableHead>
              <TableHead className="font-medium text-center">
                Mode de paiement
              </TableHead>
              <TableHead className="font-medium text-center">
                Numéro de chèque
              </TableHead>
              <TableHead className="font-medium text-center">
                Référence du document
              </TableHead>
              <TableHead className="font-medium text-center">
                Allocation
              </TableHead>
              <TableHead className="font-medium text-center">Source</TableHead>
              <TableHead className="font-medium text-center">
                Payé pour le compte de
              </TableHead>

              <TableHead className="font-medium text-center">
                Commentaire
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, idx) => (
              <TableRow key={idx} className="h-16">
                <TableCell>
                  <div className="flex justify-center items-center">
                    <Checkbox checked={false} onCheckedChange={() => {}} />
                  </div>
                </TableCell>
                <TableCell className="text-center">2024-06-01</TableCell>
                <TableCell className="text-center">Entrée</TableCell>
                <TableCell className="text-center">Vente</TableCell>
                <TableCell className="text-center">Produit</TableCell>
                <TableCell className="text-center">
                  Description exemple {idx + 1}
                </TableCell>
                <TableCell className="text-center">1000 €</TableCell>
                <TableCell className="text-center">1200 €</TableCell>
                <TableCell className="text-center">Carte</TableCell>
                <TableCell className="text-center">123456</TableCell>
                <TableCell className="text-center">DOC-00{idx + 1}</TableCell>
                <TableCell className="text-center">
                  Allocation {idx + 1}
                </TableCell>
                <TableCell className="text-center">Source {idx + 1}</TableCell>
                <TableCell className="text-center">Client {idx + 1}</TableCell>
                <TableCell className="text-center">
                  Commentaire {idx + 1}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
);

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;

// {isPending ? (
//   <TableRow>
//     <TableCell colSpan={9}>
//       <div className="flex justify-center items-center py-6 w-full">
//         <Spinner />
//       </div>
//     </TableCell>
//   </TableRow>
// ) : data?.data && data.data.length > 0 ? (
//   data.data.map((transaction) => (
//     <TableRow
//       key={transaction.id}
//       className={`h-16 transition-colors ${
//         isSelected(transaction.id) ? "bg-neutral-100" : ""
//       }`}
//     >
//       <TableCell className="text-neutral-600">
//         <div className="flex justify-center items-center">
//           <Checkbox
//             checked={isSelected(transaction.id)}
//             onCheckedChange={(checked) =>
//               toggleSelection(transaction.id, !!checked)
//             }
//           />
//         </div>
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         Photo
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         {transaction.reference}
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         {transaction.type}
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         {transaction.name}
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         {formatNumber(Number(transaction.revenueGenerate))}{" "}
//         {transaction.company.currency}
//       </TableCell>
//       <TableCell className="text-neutral-600 text-center">
//         <span
//           className={cn(
//             "flex mx-auto rounded-full w-5 h-5",
//             transaction.status === "STOP" && "bg-red",
//             transaction.status === "PROGRESS" && "bg-amber-400",
//             transaction.status === "SUCCESS" && "bg-emerald-500"
//           )}
//         ></span>
//       </TableCell>
//       <TableCell className="text-center">
//         <TableActionButton
//           menus={dropdownMenu}
//           id={transaction.id}
//           refreshTransaction={refreshTransaction}
//           deleteTitle="Confirmer la suppression de la transaction"
//           deleteMessage={
//             <p>
//               En supprimant une transaction, toutes les informations
//               liées seront également supprimées.
//               <br />
//               <span className="font-semibold text-red-600">
//                 Cette action est irréversible.
//               </span>
//               <br />
//               <br />
//               Confirmez-vous cette suppression ?
//             </p>
//           }
//         />
//       </TableCell>
//     </TableRow>
//   ))
// ) : (
//   <TableRow>
//     <TableCell
//       colSpan={9}
//       className="py-6 text-gray-500 text-sm text-center"
//     >
//       Aucune transaction trouvée.
//     </TableCell>
//   </TableRow>
// )}
