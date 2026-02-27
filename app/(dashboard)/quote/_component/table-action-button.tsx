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
import { useEffect, useState } from "react";
import { convertQuote, removeQuote } from "@/action/quote.action";
import { QuoteType } from "@/types/quote.types";
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import DuplicateForm from "./duplicate-form";
import DuplicateBillboard from "@/components/modal/duplicate-billboard";
import useItemStore, { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import { getBillboardItemLocations } from "@/action/invoice.action";
import { useDataStore } from "@/stores/data.store";
import Decimal from "decimal.js";

type TableActionButtonProps = {
  data: QuoteType;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshQuotes: () => void;
};

import { useAccess } from "@/hook/useAccess";

export default function TableActionButton({
  menus,
  data,
  deleteTitle,
  deleteMessage,
  refreshQuotes,
}: TableActionButtonProps) {
  const router = useRouter();
  const setTab = useTabStore.use.setTab();
  const setItems = useItemStore.use.setItems();
  const clear = useItemStore.use.clearItem();
  const [open, setOpen] = useState({
    duplicate: false,
    convert: false
  });
  const setLocationBillboard = useItemStore.use.setLocationBillboard();
  const locationBillboard = useItemStore.use.locationBillboardDate();
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const { access: modifyAccess } = useAccess("QUOTES", "MODIFY");
  const { access: createAccess } = useAccess("QUOTES", "CREATE");
  const { access: readAccess } = useAccess("QUOTES", "READ");
  const hasAnyAccess = modifyAccess || createAccess || readAccess;

  const { mutate: mutateDeleteQuote, isPending: isDelettingQuote } = useQueryAction<
    { id: string },
    RequestResponse<QuoteType[]>
  >(removeQuote, () => { }, "quotes");

  const { mutate: mutateConvertedQuote, isPending: isConvertingQuote } = useQueryAction<
    { id: string, items?: ItemType[] },
    RequestResponse<string>
  >(convertQuote, () => { }, "quotes");

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

  function goTo(id: string, action: "update" | "infos" | "send" | "convert") {
    switch (action) {
      case "update":
        setTab("action-quote-tab", 0);
        router.push(`/quote/${id}`);
        break;
      case "convert":
        const hasBillboard = data.items.some((item) => item.itemType === "billboard");



        if (hasBillboard && locationBillboard.length > 0) {
          handleSetItems()
          return setOpen({ ...open, convert: true })
        }
        mutateConvertedQuote({
          id, items: data.items.map((item) => ({
            ...item,
            discountType: item.discountType as "purcent" | "money",
            itemType: item.itemType as "billboard" | "product" | "service",

          }))
        }, {
          onSuccess(data) {
            if (data.data) {
              return router.push(`/invoice/${data.data}`);
            }
          },
        });

        break;
      case "infos":
        setTab("action-quote-tab", 1);
        router.push(`/quote/${id}`);
        break;
      case "send":
        setTab("action-quote-tab", 2);
        router.push(`/quote/${id}`);
        break;
    }
  }

  function handleDelete() {
    if (data.id) {
      mutateDeleteQuote(
        { id: data.id },
        {
          onSuccess() {
            refreshQuotes();
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
    mutateConvertedQuote({ id: data.id, items }, {
      onSuccess(data) {
        if (data.data) {
          clear()
          return router.push(`/invoice/${data.data}`);
        }
      },
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={!hasAnyAccess}>
        <Button variant="primary" className="p-0 rounded-lg w-9! h-9!">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {hasAnyAccess && (
        <PopoverContent align="end" className="p-0 w-45">
          <ul>
            {isGettingItemLocations ? <Spinner /> :
              <>
                {menus.map((menu) => {
                  if (
                    (["send", "update", "delete"].includes(menu.action as string) && !modifyAccess) ||
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
                          loading={isDelettingQuote}
                        />
                      );
                    case "duplicate":
                      return (
                        <ModalContainer
                          size="sm"
                          key={menu.id}
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
                          setOpen={() =>
                            setOpen({ ...open, duplicate: true })
                          }
                          onClose={() => setOpen({ ...open, duplicate: false })}
                        >
                          <DuplicateForm closeModal={() => setOpen({ ...open, duplicate: false })} id={data.id} refreshQuotes={refreshQuotes} />
                        </ModalContainer>
                      )
                    default:
                      return (
                        <li key={menu.id}>
                          <button
                            className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                            onClick={() =>
                              goTo(data.id, menu.action as "update" | "infos" | "send" | "convert")
                            }
                          >
                            <menu.icon className="w-4 h-4" />
                            <span className=" flex gap-x-2 items-center">
                              {menu.title}

                              <span>
                                {menu.action === "convert" && isConvertingQuote && <Spinner size={15} />}
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
              <DuplicateBillboard data={data} closeModal={() => setOpen({ ...open, convert: false })} duplicateTo={converToInvoice} isDuplicating={isConvertingQuote} />
            </ModalContainer>
          }
        </PopoverContent>
      )}
    </Popover>
  );
}
