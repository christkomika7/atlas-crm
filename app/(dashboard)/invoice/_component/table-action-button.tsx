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
import { getBillboardItemLocations, remove } from "@/action/invoice.action";
import { InvoiceType } from "@/types/invoice.types";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tab.store";
import ModalContainer from "@/components/modal/modal-container";
import { useEffect, useState } from "react";
import PaymentForm from "./payment-form";
import DuplicateForm from "./duplicate-form";
import useItemStore, { LocationBillboardDateType } from "@/stores/item.store";
import Decimal from "decimal.js";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { useAccess } from "@/hook/useAccess";

type TableActionButtonProps = {
  data: InvoiceType;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshInvoices: () => void;
};

export default function TableActionButton({
  menus,
  deleteTitle,
  deleteMessage,
  refreshInvoices,
  data,
}: TableActionButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openDuplicate, setOpenDuplicate] = useState(false);

  const setTab = useTabStore.use.setTab();
  const setItems = useItemStore.use.setItems();
  const clear = useItemStore.use.clearItem();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();

  const currency = useDataStore.use.currency();
  const companyId = useDataStore.use.currentCompany();

  const { access: createAccess } = useAccess("INVOICES", "CREATE");
  const { access: modifyAccess } = useAccess("INVOICES", "MODIFY");
  const { access: readAccess } = useAccess("INVOICES", "READ");

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType[]>
  >(remove, () => { }, "invoices");

  const {
    mutate: mutateGetItemLocations,
    isPending: isGettingItemLocations,
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
  }, [companyId]);

  function goTo(invoiceId: string, action: "update" | "infos" | "send") {
    switch (action) {
      case "update":
        setTab("action-invoice-tab", 0);
        router.push(`/invoice/${invoiceId}`);
        break;
      case "infos":
        setTab("action-invoice-tab", 1);
        router.push(`/invoice/${invoiceId}`);
        break;
      case "send":
        setTab("action-invoice-tab", 2);
        router.push(`/invoice/${invoiceId}`);
        break;
    }
  }

  function handleDelete() {
    if (data.id) {
      mutate(
        { id: data.id },
        { onSuccess: refreshInvoices }
      );
    }
  }

  function handleSetItems() {
    clear();
    setItems(
      data.items
        .filter((item) => item.itemType === "billboard")
        .map((item) => ({
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
          currency,
          itemType: "billboard",
          billboardId: item.billboardId,
        }))
    );
  }

  const isFullyRestricted =
    !createAccess &&
    !modifyAccess &&
    !readAccess;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          className="p-0 rounded-lg !w-9 !h-9"
          disabled={isFullyRestricted}
        >
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>

      {!isFullyRestricted && (
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {isGettingItemLocations ? (
              <Spinner />
            ) : (
              <>
                {menus.map((menu, index) => {
                  if (
                    (["send", "update", "add", "delete"].includes(menu.action as string) &&
                      !modifyAccess)
                  )
                    return null;

                  if (menu.action === "duplicate" && !createAccess)
                    return null;

                  if (menu.action === "infos" && !readAccess)
                    return null;

                  switch (menu.action) {
                    case "add":
                      return (
                        <li key={index}>
                          <ModalContainer
                            action={
                              <button className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer">
                                <menu.icon className="w-4 h-4" />
                                {menu.title}
                              </button>
                            }
                            title="Enregistrer un paiement"
                            open={open}
                            setOpen={setOpen}
                            onClose={() => setOpen(false)}
                          >
                            <PaymentForm
                              closeModal={() => setOpen(false)}
                              invoiceId={data.id}
                              refresh={refreshInvoices}
                            />
                          </ModalContainer>
                        </li>
                      );

                    case "delete":
                      return (
                        <ConfirmDialog
                          key={index}
                          type="delete"
                          title={deleteTitle}
                          message={deleteMessage}
                          action={handleDelete}
                          loading={isPending}
                        />
                      );

                    case "duplicate":
                      return (
                        <li key={index}>
                          <ModalContainer
                            size="sm"
                            action={
                              <button
                                className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                                onClick={handleSetItems}
                              >
                                <menu.icon className="w-4 h-4" />
                                {menu.title}
                              </button>
                            }
                            title="Dupliquer la facture"
                            open={openDuplicate}
                            setOpen={() => setOpenDuplicate(true)}
                            onClose={() => setOpenDuplicate(false)}
                          >
                            <DuplicateForm
                              closeModal={() => setOpenDuplicate(false)}
                              data={data}
                              refreshInvoices={refreshInvoices}
                            />
                          </ModalContainer>
                        </li>
                      );

                    default:
                      return (
                        <li key={index}>
                          <button
                            className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                            onClick={() =>
                              goTo(data.id, menu.action as "update" | "infos" | "send")
                            }
                          >
                            <menu.icon className="w-4 h-4" />
                            {menu.title}
                          </button>
                        </li>
                      );
                  }
                })}
              </>
            )}
          </ul>
        </PopoverContent>
      )}
    </Popover>
  );
}
