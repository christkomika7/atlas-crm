import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableActionButtonType } from "@/types/table.types";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tab.store";
import { completeDeliveryNote, convertDeliveryNote, removeDeliveryNote } from "@/action/delivery-note.action";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import { useEffect, useState } from "react";
import DuplicateForm from "./duplicate-form";
import useItemStore, { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import DuplicateBillboard from "@/components/modal/duplicate-billboard";
import { useDataStore } from "@/stores/data.store";
import { getBillboardItemLocations } from "@/action/invoice.action";
import { useAccess } from "@/hook/useAccess";
import Decimal from "decimal.js";

type TableActionButtonProps = {
  data: DeliveryNoteType;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshDeliveryNote: () => void;
};


export default function TableActionButton({
  menus,
  data,
  deleteTitle,
  deleteMessage,
  refreshDeliveryNote,
}: TableActionButtonProps) {
  const router = useRouter();
  const setTab = useTabStore.use.setTab();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();
  const setItems = useItemStore.use.setItems();
  const clear = useItemStore.use.clearItem();

  const [open, setOpen] = useState({
    duplicate: false,
    convert: false
  });

  const modifyAccess = useAccess("DELIVERY_NOTES", "MODIFY");
  const createAccess = useAccess("DELIVERY_NOTES", "CREATE");
  const readAccess = useAccess("DELIVERY_NOTES", "READ");
  const hasAnyAccess = modifyAccess || createAccess || readAccess;

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<DeliveryNoteType[]>
  >(removeDeliveryNote, () => { }, "delivery-notes");

  const { mutate: mutateCompleteDeliveryNote, isPending: isCompletedDeliveryNote } = useQueryAction<
    { id: string },
    RequestResponse<null>
  >(completeDeliveryNote, () => { }, "delivery-notes");

  const { mutate: mutateConvertDeliveryNote, isPending: isConvertingDeliveryNote } = useQueryAction<
    { id: string, items?: ItemType[] },
    RequestResponse<string>
  >(convertDeliveryNote, () => { }, "delivery-notes");

  const {
    mutate: mutateGetItemLocations,
    isPending: isGettingItemLocations
  } = useQueryAction<{ companyId: string }, RequestResponse<LocationBillboardDateType[]>>(
    getBillboardItemLocations,
    () => { },
    "item-locations"
  );

  useEffect(() => {
    if (companyId) {
      mutateGetItemLocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLocationBillboard(data.data);
          }
        },
      });
    }

  }, [companyId])

  function goTo(id: string, action: "update" | "infos" | "send" | "complete" | "convert") {
    switch (action) {
      case "update":
        setTab("action-delivery-note-tab", 0);
        router.push(`/delivery-note/${id}`);
        break;
      case "convert":
        const hasBillboard = data.items.some((item) => item.itemType === "billboard");
        if (hasBillboard) {
          handleSetItems()
          return setOpen({ ...open, convert: true })
        }
        mutateConvertDeliveryNote({ id }, {
          onSuccess(data) {
            if (data.data) {
              return router.push(`/invoice/${data.data}`);
            }
          },
        });

        break;
      case "infos":
        setTab("action-delivery-note-tab", 1);
        router.push(`/delivery-note/${id}`);
        break;
      case "complete":
        mutateCompleteDeliveryNote({ id }, {
          onSuccess() {
            refreshDeliveryNote()
          },
        })
        break;
      case "send":
        setTab("action-delivery-note-tab", 2);
        router.push(`/delivery-note/${id}`);
        break;
    }
  }

  function handleDelete() {
    if (data.id) {
      mutate(
        { id: data.id },
        {
          onSuccess() {
            refreshDeliveryNote();
          },
        }
      );
    }
  }

  function handleSetItems() {
    clear()
    setItems(data.items.filter((item) => item.itemType === "billboard").map(item => ({
      id: item.id,
      name: item.name,
      reference: item.reference,
      hasTax: item.hasTax,
      description: item.description,
      price: new Decimal(item.price),
      billboardReference: item.billboardId,
      updatedPrice: new Decimal(item.updatedPrice),
      discountType: item.discountType as "purcent" | "money",
      discount: item.discount,
      quantity: item.quantity,
      locationStart: item.locationStart,
      locationEnd: item.locationEnd,
      currency: currency,
      itemType: "billboard",
      billboardId: item.billboardId
    })));
  }

  function converToInvoice(items?: ItemType[]) {
    mutateConvertDeliveryNote({ id: data.id, items }, {
      onSuccess(data) {
        if (data.data) {
          return router.push(`/invoice/${data.data}`);
        }
      },
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={!hasAnyAccess}>
        <Button variant="primary" className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {hasAnyAccess && (
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {isGettingItemLocations ? <Spinner /> :
              <>
                {menus.map((menu) => {
                  if (
                    (["send", "update", "delete", "complete"].includes(menu.action as string) && !modifyAccess) ||
                    (["duplicate", "convert"].includes(menu.action as string) && !createAccess) ||
                    (menu.action === "infos" && !readAccess)
                  ) return null;

                  switch (menu.action) {
                    case "delete":
                      return (
                        <ConfirmDialog
                          key={menu.id}
                          type="delete"
                          title={deleteTitle}
                          message={deleteMessage}
                          action={handleDelete}
                          loading={isPending}
                        />
                      );
                    case "duplicate":
                      return (
                        <ModalContainer
                          size="sm"
                          action={
                            <li key={menu.id}>
                              <button
                                className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"

                              >
                                <menu.icon className="w-4 h-4" />
                                {menu.title}

                              </button>
                            </li>
                          }
                          title="Dupliquer le devis"
                          open={open.duplicate}
                          setOpen={(value) =>
                            setOpen({ ...open, duplicate: true })
                          }
                          onClose={() => setOpen({ ...open, duplicate: false })}
                        >
                          <DuplicateForm closeModal={() => setOpen({ ...open, duplicate: false })} id={data.id} refreshDeliveryNote={refreshDeliveryNote} />
                        </ModalContainer>
                      )
                    default:
                      return (
                        <li key={menu.id}>
                          <button
                            className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                            onClick={() =>
                              goTo(data.id, menu.action as "update" | "infos" | "send" | "complete")
                            }
                          >
                            <menu.icon className="w-4 h-4" />
                            <span className=" flex gap-x-2 items-center">
                              {menu.title}

                              <span>
                                {menu.action === "complete" && isCompletedDeliveryNote && <Spinner size={15} />}
                                {menu.action === "convert" && isConvertingDeliveryNote && <Spinner size={15} />}
                              </span>

                            </span>
                          </button>
                        </li>
                      );
                  }
                })}
              </>
            }
          </ul>
          {createAccess &&
            <ModalContainer
              size="md"
              title="Correction conflit panneau"
              open={open.convert}
              setOpen={() =>
                setOpen({ ...open, convert: true })
              }
              onClose={() => setOpen({ ...open, convert: false })}
            >
              <DuplicateBillboard data={data} closeModal={() => setOpen({ ...open, convert: false })} duplicateTo={converToInvoice} isDuplicating={isConvertingDeliveryNote} />
            </ModalContainer>
          }
        </PopoverContent>
      )}
    </Popover>
  );
}
