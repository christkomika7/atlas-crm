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
import { remove } from "@/action/purchase-order.action";
import { useRouter } from "next/navigation";
import useTabStore from "@/stores/tab.store";
import ModalContainer from "@/components/modal/modal-container";
import { useState } from "react";
import PaymentForm from "./payment-form";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { useAccess } from "@/hook/useAccess";
import { renderComponentToPDF } from "@/lib/pdf";
import RecordDocument from "@/components/pdf/record";
import { generateAmaId } from "@/lib/utils";
import { formatDateToDashModel } from "@/lib/date";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import Spinner from "@/components/ui/spinner";

type TableActionButtonProps = {
  data: PurchaseOrderType;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshPurchaseOrder: () => void;
};

export default function TableActionButton({
  menus,
  data,
  deleteTitle,
  deleteMessage,
  refreshPurchaseOrder,
}: TableActionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const setTab = useTabStore.use.setTab();
  const [isLoading, setIsLoading] = useState(false);

  const { access: readAccess } = useAccess("PURCHASE_ORDER", "READ");
  const { access: createAccess } = useAccess("PURCHASE_ORDER", "CREATE");
  const { access: modifyAccess } = useAccess("PURCHASE_ORDER", "MODIFY");

  const hasAnyAccess = modifyAccess || createAccess || readAccess;

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<PurchaseOrderType[]>
  >(remove, () => { }, "purchase-order");

  async function handleDownload() {
    setIsLoading(true);
    const recordDocument = data.company?.documentModel;
    const filename = `Bon de commande  ${recordDocument?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(data.purchaseOrderNumber ?? 1, false)}`;

    const pdfData = await renderComponentToPDF(
      <RecordDocument
        title="Bon de commande"
        type="Bon de commande"
        id="purchase-order-bc"
        firstColor={recordDocument?.primaryColor || "#fbbf24"}
        secondColor={recordDocument?.secondaryColor || "#fef3c7"}
        logo={recordDocument?.logo}
        logoSize={recordDocument?.size || "Medium"}
        logoPosition={recordDocument?.position || "Center"}
        orderValue={recordDocument?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}
        orderNote={recordDocument?.purchaseOrderInfo || ""}
        record={data}
        recordNumber={`${generateAmaId(data.purchaseOrderNumber ?? 1, false)}`}
        isLoading={false}
        note={recordDocument?.purchaseOrderInfo}
      />,
      {
        padding: 0,
        margin: 0,
        quality: 0.98,
        scale: 4,
        headerText: `- ${filename} - ${formatDateToDashModel(new Date(data.createdAt || new Date()))}`,
      }
    );

    const blob = new Blob([pdfData], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setIsLoading(false);
  }

  function goTo(id: string, action: "update" | "infos" | "send" | "download") {
    switch (action) {
      case "download":
        handleDownload();
        break;
      case "update":
        setTab("action-purchase-order-tab", 0);
        router.push(`/purchase-order/${id}`);
        break;
      case "infos":
        setTab("action-purchase-order-tab", 1);
        router.push(`/purchase-order/${id}`);
        break;
      case "send":
        setTab("action-purchase-order-tab", 2);
        router.push(`/purchase-order/${id}`);
        break;
    }
  }

  function handleDelete() {
    if (data.id) {
      mutate(
        { id: data.id },
        {
          onSuccess() {
            refreshPurchaseOrder();
          },
        }
      );
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={!hasAnyAccess}>
        <Button variant="primary" className="p-0 rounded-lg size-9!">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {hasAnyAccess &&
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {menus.map((menu) => {
              if (
                (["send", "update", "delete", "add"].includes(menu.action as string) && !modifyAccess) ||
                (["convert"].includes(menu.action as string) && !createAccess) ||
                (menu.action === "infos" && !readAccess)
              ) return null;

              switch (menu.action) {
                case "add":
                  return (
                    <li key={menu.id}>
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
                        <PaymentForm refresh={refreshPurchaseOrder} closeModal={() => setOpen(false)} purchaseOrderId={data.id} />
                      </ModalContainer>
                    </li>
                  );
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
                default:
                  return (
                    <li key={menu.id}>
                      <button
                        className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                        onClick={() =>
                          goTo(data.id, menu.action as "update" | "infos" | "send" | "download")
                        }
                      >
                        <menu.icon className="w-4 h-4" />
                        {menu.title}
                        {isLoading && menu.action === "download" && <Spinner size={16} />}
                      </button>
                    </li>
                  );
              }
            })}
          </ul>
        </PopoverContent>
      }
    </Popover>
  );
}
