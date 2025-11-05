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
import { useState } from "react";
import { convertQuote, removeQuote } from "@/action/quote.action";
import { QuoteType } from "@/types/quote.types";
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import DuplicateForm from "./duplicate-form";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshQuotes: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshQuotes,
}: TableActionButtonProps) {
  const router = useRouter();
  const setTab = useTabStore.use.setTab();
  const [open, setOpen] = useState(false);

  const { mutate: mutateDeleteQuote, isPending: isDelettingQuote } = useQueryAction<
    { id: string },
    RequestResponse<QuoteType[]>
  >(removeQuote, () => { }, "quotes");

  const { mutate: mutateConvertedQuote, isPending: isConvertingQuote } = useQueryAction<
    { id: string },
    RequestResponse<string>
  >(convertQuote, () => { }, "quotes");

  function goTo(id: string, action: "update" | "preview" | "send" | "convert") {
    switch (action) {
      case "update":
        setTab("action-quote-tab", 0);
        router.push(`/quote/${id}`);
        break;
      case "convert":
        mutateConvertedQuote({ id }, {
          onSuccess(data) {
            if (data.data) {
              return router.push(`/invoice/${data.data}`);
            }
          },
        })
        break;
      case "preview":
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
    if (id) {
      mutateDeleteQuote(
        { id },
        {
          onSuccess() {
            refreshQuotes();
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
                    loading={isDelettingQuote}
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
                    open={open}
                    setOpen={(value) =>
                      setOpen(true)
                    }
                    onClose={() => setOpen(false)}
                  >
                    <DuplicateForm closeModal={() => setOpen(false)} id={id} refreshQuotes={refreshQuotes} />
                  </ModalContainer>
                )
              default:
                return (
                  <li key={menu.id}>
                    <button
                      className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                      onClick={() =>
                        goTo(id, menu.id as "update" | "preview" | "send" | "convert")
                      }
                    >
                      <menu.icon className="w-4 h-4" />
                      <span className=" flex gap-x-2 items-center">
                        {menu.title}

                        <span>
                          {menu.id === "convert" && isConvertingQuote && <Spinner size={15} />}
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
