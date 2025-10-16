"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import BillboardDetails from "../billboard-details";
import BillboardRevenue from "../billboard-revenue";
import { useParams } from "next/navigation";
import useQueryAction from "@/hook/useQueryAction";
import { BillboardInfo, ItemInfos, ItemType } from "@/types/item.type";
import { RequestResponse } from "@/types/api.types";
import { allBillboardItem } from "@/action/item.action";
import Spinner from "@/components/ui/spinner";
import { unique as getUniqueDocument } from "@/action/document.action";
import { ModelDocumentType, PrefixType } from "@/types/document.types";
import { useDataStore } from "@/stores/data.store";
import { getMonthsAndDaysDifference } from "@/lib/date";
import { formatNumber, generateAmaId, getPrefix } from "@/lib/utils";
import { unique as getUniqueBillboard } from "@/action/billboard.action";
import { BillboardType } from "@/types/billboard.types";
import { Decimal } from "decimal.js";

export default function InfoTab() {
  const param = useParams();
  const companyId = useDataStore.use.currentCompany();
  const [items, setItems] = useState<ItemInfos[]>([]);
  const [billboard, setBillboard] = useState<BillboardInfo>({
    name: "",
    category: "",
    emplacement: "",
    neighbourhood: "",
    address: "",
  });
  const [prefixs, setPrefixs] = useState<PrefixType>({
    invoices: "",
    quotes: "",
    purchaseOrders: "",
    deliveryNotes: "",
    creditNotes: "",
  });
  const { mutate, isPending } = useQueryAction<
    { billboardId: string },
    RequestResponse<ItemType[]>
  >(allBillboardItem, () => { }, "items");

  const { mutate: getDocumentModel, isPending: isLoadingDocumentModel } =
    useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
      getUniqueDocument,
      () => { },
      "document"
    );

  const { mutate: getBillboard, isPending: isLoadingBillboard } =
    useQueryAction<{ id: string }, RequestResponse<BillboardType>>(
      getUniqueBillboard,
      () => { },
      "billboard"
    );

  useEffect(() => {
    if (param.id) {
      mutate(
        { billboardId: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              const billboardItems = data.data;
              setItems([
                ...billboardItems.map((billboardItem) => ({
                  id: billboardItem.id,
                  client: `${billboardItem.billboard.client.firstname} ${billboardItem.billboard.client.lastname}`,
                  startDate: billboardItem.locationStart,
                  endDate: billboardItem.locationEnd,
                  invoideNumber: billboardItem.invoice.invoiceNumber,
                  itemInvoiceType: billboardItem.itemInvoiceType,
                  currency: billboardItem.currency,
                  amount: new Decimal(billboardItem.updatedPrice),
                  createdAt: billboardItem.createdAt,
                })),
              ]);
            }
          },
        }
      );

      getBillboard(
        {
          id: param.id as string,
        },
        {
          onSuccess(data) {
            if (data.data) {
              const billboardData = data.data;
              setBillboard({
                name: billboardData.name,
                category: billboardData.type.name,
                emplacement: billboardData.city.name,
                neighbourhood: billboardData.area.name,
                address: billboardData.placement
              });
            }
          },
        }
      );
    }
  }, [param]);

  useEffect(() => {
    if (companyId) {
      getDocumentModel(
        { id: companyId },
        {
          onSuccess(data) {
            if (data.data) {
              const modelDocument = data.data;
              setPrefixs({
                invoices: modelDocument.invoicesPrefix || "Facture",
                quotes: modelDocument.quotesPrefix || "Devis",
                purchaseOrders:
                  modelDocument.purchaseOrderPrefix || "Bon_Commande",
                deliveryNotes:
                  modelDocument.deliveryNotesPrefix || "Bon_Livraison",
                creditNotes: "Avoirs",
              });
            }
          },
        }
      );
    }
  }, [companyId]);

  if (isPending || isLoadingDocumentModel || isLoadingBillboard)
    return <Spinner />;
  return (
    <ScrollArea className="h-[calc(100vh-176px)]">
      <div className="space-y-4 pt-2 pr-4 pb-4">
        <div className="gap-x-3 grid grid-cols-[1fr_2fr]">
          <BillboardDetails detail={billboard} />
          <BillboardRevenue
            sales={items.map((item) => ({
              id: item.id,
              startDate: item.startDate,
              endDate: item.endDate,
              amount: item.amount,
            }))}
          />
        </div>

        <div className="border border-neutral-200 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="font-medium text-center">Date</TableHead>
                <TableHead className="font-medium text-center">
                  Mois de location
                </TableHead>
                <TableHead className="font-medium text-center">
                  N° facture
                </TableHead>
                <TableHead className="font-medium text-center">
                  Client
                </TableHead>
                <TableHead className="font-medium text-center">
                  Sommes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id} className={`h-16 transition-colors`}>
                    <TableCell className="text-neutral-600 text-center">
                      {new Date(item.createdAt)
                        .toLocaleDateString()
                        .replaceAll("/", "-")}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {getMonthsAndDaysDifference(item.startDate, item.endDate)}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {getPrefix(item.itemInvoiceType, prefixs)}-
                      {generateAmaId(item.invoideNumber, false)}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {item.client}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-center">
                      {formatNumber(item.amount)} {item.currency}
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
      </div>
    </ScrollArea>
  );
}
