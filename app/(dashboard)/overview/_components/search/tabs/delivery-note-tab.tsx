import { getAllDeliveryNote } from "@/action/delivery-note.action";
import { dropdownMenu } from "@/app/(dashboard)/delivery-note/_component/table";
import TableActionButton from "@/app/(dashboard)/delivery-note/_component/table-action-button";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE, DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { formatDateToDashModel } from "@/lib/date";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useSearchStore from "@/stores/search.store";
import { RequestResponse } from "@/types/api.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function DeliveryNoteTab() {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteType[]>([]);
  const id = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();


  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const search = useSearchStore.use.search();

  const [debouncedSearch] = useDebounce(search, 500);

  const { access: readAccess, loading } = useAccess("DELIVERY_NOTES", "READ");

  const { mutate, isPending } = useQueryAction<
    { companyId: string; search?: string, skip?: number; take?: number },
    RequestResponse<DeliveryNoteType[]>
  >(getAllDeliveryNote, () => { }, "delivery-notes");

  const refreshDeliveryNote = (searchValue?: string) => {
    if (id && readAccess) {
      mutate({ companyId: id, search: searchValue, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setDeliveryNotes(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  };

  useEffect(() => {
    refreshDeliveryNote();
  }, [id, readAccess, currentPage]);

  useEffect(() => {
    refreshDeliveryNote(debouncedSearch)
  }, [readAccess, id, debouncedSearch])

  return (
    <AccessContainer hasAccess={readAccess} resource="DELIVERY_NOTES" loading={loading} >
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="font-medium text-center">N°</TableHead>
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Montant</TableHead>
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
            ) : deliveryNotes.length > 0 ? (
              deliveryNotes.map((deliveryNote) => (
                <TableRow
                  key={deliveryNote.id}
                  className="h-16 transition-colors"
                >
                  <TableCell className="text-neutral-600 text-center">
                    {deliveryNote.company?.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-
                    {generateAmaId(deliveryNote.deliveryNoteNumber, false)}

                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${deliveryNote.client.companyName}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatDateToDashModel(deliveryNote.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(deliveryNote.amountType === "TTC" ? deliveryNote.totalTTC : deliveryNote.totalHT)} {currency}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      data={deliveryNote}
                      refreshDeliveryNote={refreshDeliveryNote}
                      deleteTitle="Confirmer la suppression du bon de livraison"
                      deleteMessage={
                        <p>
                          En supprimant le bon de livraison, toutes les informations
                          liées seront également supprimées.
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
                  Aucun bon de livraison trouvé.
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
