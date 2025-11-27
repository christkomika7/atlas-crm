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
import { ProjectType } from "@/types/project.types";
import { remove } from "@/action/project.action";
import { useParams, useRouter } from "next/navigation";
import { useAccess } from "@/hook/useAccess";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshProjects?: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshProjects,
}: TableActionButtonProps) {
  const router = useRouter();
  const param = useParams();

  const { access: readAccess } = useAccess("PROJECTS", "READ");
  const { access: modifyAccess } = useAccess("PROJECTS", "MODIFY");

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<ProjectType>
  >(remove, () => { }, "projects");

  function goTo(id: string, type: string) {
    if (type === "Infos")
      return router.push(`/client/${param.id}/project/${id}`);
    router.push(`/client/${param.id}/project/${id}/edit`);
  }

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            if (refreshProjects) refreshProjects();
          },
        }
      );
    }
  }

  const isFullyRestricted = !readAccess && !modifyAccess;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" disabled={isFullyRestricted} className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {!isFullyRestricted && (
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {menus.map((menu) => {
              if ((["update", "delete"].includes(menu.action as string) && !modifyAccess)) return null;
              if (menu.action === "infos" && !readAccess) return null;
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
                  )

                default:
                  return (
                    <li key={menu.id}>
                      <button
                        className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                        onClick={() => goTo(id, menu.title)}
                      >
                        <menu.icon className="w-4 h-4" />
                        {menu.title}
                      </button>
                    </li>
                  )
              }
            })}
          </ul>
        </PopoverContent>
      )}
    </Popover>
  );
}
