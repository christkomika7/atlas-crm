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
import { remove } from "@/action/appointment.action";
import { useRouter } from "next/navigation";
import { AppointmentType } from "@/types/appointment.type";
import AppointmentsEditModal from "./contract-edit-modal";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshClients: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshClients,
}: TableActionButtonProps) {
  const router = useRouter();
  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<AppointmentType[]>
  >(remove, () => { }, "appointments");

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            refreshClients();
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
                <AppointmentsEditModal id={id} title={menu.title} />
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
