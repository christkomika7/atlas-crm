"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { useEffect, useState } from "react";

import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { getDeliveryNote } from "@/action/client.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";
import { useParams } from "next/navigation";
import { dropdownMenu } from "@/app/(dashboard)/delivery-note/_component/table";
import TableActionButton from "@/app/(dashboard)/delivery-note/_component/table-action-button";
import { DeliveryNoteType } from "@/types/delivery-note.types";


export default function DeliveryNotesTab() {
  const client = useParams();
  const currency = useDataStore.use.currency();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteType[]>([]);
  const reset = useDataStore.use.state();


  const ids = useDataStore.use.ids()
  const addId = useDataStore.use.addId();
  const removeId = useDataStore.use.addId();

  const { mutate: mutateGetDeliveryNote, isPending: isGettingDeliveryNote } = useQueryAction<
    { id: string },
    RequestResponse<DeliveryNoteType[]>
  >(getDeliveryNote, () => { }, "delivery-notes");

  useEffect(() => {
    refreshDeliveryNote();
  }, [reset])

  useEffect(() => {
    refreshDeliveryNote()
  }, [client.id])

  function refreshDeliveryNote() {
    if (client.id) {
      mutateGetDeliveryNote({ id: client.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setDeliveryNotes(data.data)
          }
        },
      })
    }
  }

  const toggleSelection = (deliveryNoteId: string) => {
    if (ids.includes(deliveryNoteId)) {
      removeId(deliveryNoteId);
    } else {
      addId(deliveryNoteId);
    }
  };

  const isSelected = (id: string) => ids.includes(id);

  return (
    <div className="border border-neutral-200 rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium text-center">
              Sélection
            </TableHead>
            <TableHead className="font-medium text-center">
              Numéro du document
            </TableHead>
            <TableHead className="font-medium text-center">
              Date du document
            </TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isGettingDeliveryNote ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : deliveryNotes.length > 0 ? (
            deliveryNotes.map((deliveryNote) => (
              <TableRow
                key={deliveryNote.id}
                className={`h-16 transition-colors ${isSelected(deliveryNote.id) ? "bg-neutral-100" : ""
                  }`}
              >
                <TableCell className="text-neutral-600">
                  <div className="flex justify-center items-center">
                    <Checkbox
                      checked={isSelected(deliveryNote.id)}
                      onCheckedChange={() => toggleSelection(deliveryNote.id)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {deliveryNote.company.documentModel.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-{generateAmaId(deliveryNote.deliveryNoteNumber, false)}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatDateToDashModel(deliveryNote.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <TableActionButton
                    menus={dropdownMenu}
                    id={deliveryNote.id}
                    refreshDeliveryNote={refreshDeliveryNote}
                    deleteTitle="Confirmer la suppression du bon de livraison"
                    deleteMessage={
                      <p>
                        En supprimant ce bon de livraison, toutes les informations liées
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
                Aucun bon de livraison trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
