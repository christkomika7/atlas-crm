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
import { removeQuote } from "@/action/quote.action";
import { QuoteType } from "@/types/quote.types";

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
  const [open, setOpen] = useState(false);
  const setTab = useTabStore.use.setTab();
  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<QuoteType[]>
  >(removeQuote, () => { }, "quotes");

  function goTo(id: string, action: "update" | "preview" | "send") {
    switch (action) {
      case "update":
        setTab("action-quote-tab", 0);
        router.push(`/quote/${id}`);
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
      mutate(
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
                    loading={isPending}
                  />
                );
              default:
                return (
                  <li key={menu.id}>
                    <button
                      className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                      onClick={() =>
                        goTo(id, menu.id as "update" | "preview" | "send")
                      }
                    >
                      <menu.icon className="w-4 h-4" />
                      {menu.title}
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
