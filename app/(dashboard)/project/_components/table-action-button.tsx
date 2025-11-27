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
import { remove } from "@/action/project.action";
import { useRouter } from "next/navigation";
import ModalContainer from "@/components/modal/modal-container";
import { useState } from "react";
import { ProjectType } from "@/types/project.types";
import ProjectEditForm from "./project-edit-form";
import { useAccess } from "@/hook/useAccess";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshData: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshData,
}: TableActionButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter();

  const { access: readAccess } = useAccess("PROJECTS", "READ");
  const { access: modifyAccess } = useAccess("PROJECTS", "MODIFY");

  const hasAnyAccess = modifyAccess || readAccess;


  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<ProjectType>
  >(remove, () => { }, "projects");

  function goTo(id: string) {
    return router.push(`/project/${id}`);
  }

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            if (refreshData) refreshData();
          },
        }
      );
    }
  }


  return (
    <Popover>
      <PopoverTrigger asChild disabled={!hasAnyAccess}>
        <Button variant="primary" className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {hasAnyAccess &&
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {menus.map((menu) => {
              if (
                (["update", "delete"].includes(menu.action as string) && !modifyAccess) ||
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
                      loading={isPending}
                    />
                  );
                case "infos":
                  return (
                    <li key={menu.id}>
                      <button
                        className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                        onClick={() => goTo(id)}
                      >
                        <menu.icon className="w-4 h-4" />
                        {menu.title}
                      </button>
                    </li>
                  )

                default:
                  return (
                    <li key={menu.id}>
                      <ModalContainer
                        size="sm"
                        action={
                          <button
                            className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                          >
                            <menu.icon className="w-4 h-4" />
                            {menu.title}
                          </button>
                        }
                        title="Mise à jour du projet"
                        open={open}
                        setOpen={(value) =>
                          setOpen(value as boolean)
                        }
                        onClose={() => setOpen(false)}
                      >
                        <ProjectEditForm closeModal={() => setOpen(false)} id={id} refreshData={refreshData} />
                      </ModalContainer>
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
