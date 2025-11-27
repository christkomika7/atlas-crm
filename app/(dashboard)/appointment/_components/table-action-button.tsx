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
import { AppointmentType } from "@/types/appointment.type";
import AppointmentsEditModal from "./appointment-edit-modal";
import { useAccess } from "@/hook/useAccess";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshAppointment: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshAppointment,
}: TableActionButtonProps) {

  const { access: modifyAccess } = useAccess("APPOINTMENT", "MODIFY");

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
            refreshAppointment();
          },
        }
      );
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={!modifyAccess}>
        <Button variant="primary" className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {modifyAccess &&
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {menus.map((menu) => {
              if (
                (["update", "delete"].includes(menu.action as string) &&
                  !modifyAccess)
              )
                return null;
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
                default:
                  return (
                    <li key={menu.id}>
                      <AppointmentsEditModal id={id} title={menu.title} refreshAppointment={refreshAppointment} />
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
