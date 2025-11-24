import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "../icons";
import { TableActionButtonType } from "@/types/table.types";
import ConfirmDialog from "../ui/confirm-dialog";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { remove } from "@/action/company.action";
import { UserType } from "@/types/user.types";
import useCompanyStore from "@/stores/company.store";
import { useEmployeeStore } from "@/stores/employee.store";
import { useRouter } from "next/navigation";
import AlertDialogMessage from "../alert-dialog/alert-dialog-message";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import Spinner from "../ui/spinner";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
};

export default function TableActionButton({
  menus,
  id,
  deleteMessage,
}: TableActionButtonProps) {
  const clearCompany = useCompanyStore.use.clearCompany();
  const resetEmployees = useEmployeeStore.use.resetEmployees();
  const [currentId, setCurrentId] = useState("");

  const router = useRouter();

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<CompanyType[]>
  >(remove, () => { }, "companies");

  function handleDelete() {

    if (id) {
      setCurrentId(id)
      mutate({ id }, {
        onSuccess() {
          setCurrentId("");
        }
      });
    }
  }

  function goTo(id: string) {
    clearCompany();
    resetEmployees();
    router.push(`/settings/company/edit/${id}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="stroke-white !w-3.5 !h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[180px]">
        <ul>
          {menus.map((menu) => {
            if (menu.action === "delete")
              return (
                <AlertDialogMessage
                  key={menu.id}
                  type="delete"
                  isLoading={isPending}
                  actionButton={
                    <button className="flex items-center gap-x-2 hover:bg-red/5 px-4 py-3 w-full font-medium text-red text-sm cursor-pointer">
                      <Trash2Icon className="w-4 h-4" />
                      Supprimer
                    </button>
                  }
                  title="Confirmer la suppression"
                  message={deleteMessage}
                  confirmAction={handleDelete}
                />
              );
            return (
              <li key={menu.id}>
                <button
                  className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                  onClick={() => goTo(id)}
                >
                  <menu.icon className="w-4 h-4" />
                  {menu.title}
                  {currentId === id && isPending && <Spinner size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
