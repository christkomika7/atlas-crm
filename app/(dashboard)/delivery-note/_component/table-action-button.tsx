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
import { completeDeliveryNote, removeDeliveryNote } from "@/action/delivery-note.action";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import { useState } from "react";
import DuplicateForm from "./duplicate-form";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshDeliveryNote: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshDeliveryNote,
}: TableActionButtonProps) {
  const router = useRouter();
  const setTab = useTabStore.use.setTab();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<DeliveryNoteType[]>
  >(removeDeliveryNote, () => { }, "delivery-notes");

  const { mutate: mutateCompleteDeliveryNote, isPending: isCompletedDeliveryNote } = useQueryAction<
    { id: string },
    RequestResponse<null>
  >(completeDeliveryNote, () => { }, "delivery-notes");

  function goTo(id: string, action: "update" | "preview" | "send" | "complete" | "duplicate" | "convert") {
    switch (action) {
      case "update":
        setTab("action-delivery-note-tab", 0);
        router.push(`/delivery-note/${id}`);
        break;
      case "preview":
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
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            refreshDeliveryNote();
          },
        }
      );
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[180px]">
        <ul>
          {menus.map((menu) => {
            switch (menu.id) {
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
                    title="Convertir le devis"
                    open={open}
                    setOpen={(value) =>
                      setOpen(true)
                    }
                    onClose={() => setOpen(false)}
                  >
                    <DuplicateForm closeModal={() => setOpen(false)} id={id} refreshDeliveryNote={refreshDeliveryNote} />
                  </ModalContainer>
                )
              default:
                return (
                  <li key={menu.id}>
                    <button
                      className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                      onClick={() =>
                        goTo(id, menu.id as "update" | "preview" | "send" | "complete")
                      }
                    >
                      <menu.icon className="w-4 h-4" />
                      <span className=" flex gap-x-2 items-center">
                        {menu.title}

                        <span>
                          {menu.id === "complete" && isCompletedDeliveryNote && <Spinner size={15} />}
                        </span>

                      </span>
                    </button>
                  </li>
                );
            }
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
