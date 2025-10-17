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
import { duplicateBillboard, remove } from "@/action/billboard.action";
import { useRouter } from "next/navigation";
import { BillboardType } from "@/types/billboard.types";
import BillboardCreateContractModal from "./billboard-create-brochure-modal";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshBillboard: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshBillboard,
}: TableActionButtonProps) {
  const router = useRouter();
  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<BillboardType>
  >(remove, () => { }, "billboards");


  const { mutate: mutateDuplicateBillboard, isPending: isDuplicatingBillboard } = useQueryAction<
    { id: string },
    RequestResponse<null>
  >(duplicateBillboard, () => { }, "billboard");

  function goTo(id: string, action: "update" | "infos" | "duplicate") {
    switch (action) {
      case "update":
        router.push(`/billboard/edit/${id}`);
        break;
      case "infos":
        router.push(`/billboard/infos/${id}`);
        break;
      case "duplicate":
        mutateDuplicateBillboard({ id }, {
          onSuccess() {
            refreshBillboard()
          },
        })
        break;
    }
  }

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            refreshBillboard();
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
      <PopoverContent align="end" className="p-0 w-[200px]">
        <ul>
          {menus.map((menu) => {
            if (menu.action === "delete")
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
            return (
              <li key={menu.id}>
                <button
                  className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    goTo(id, menu.action as "update" | "infos" | "duplicate")
                  }}
                >
                  <menu.icon className="w-4 h-4" />
                  {menu.title}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
