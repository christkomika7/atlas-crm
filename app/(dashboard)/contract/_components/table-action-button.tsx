import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableActionButtonType } from "@/types/table.types";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { exportClientContractToWord, exportLessorContractToWord, removeContract } from "@/action/contract.action";
import { $Enums } from "@/lib/generated/prisma";
import { useAccess } from "@/hook/useAccess";
import { toast } from "sonner";

import ConfirmDialog from "@/components/ui/confirm-dialog";
import Spinner from "@/components/ui/spinner";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshContract: () => void;
  contract: $Enums.ContractType
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshContract,
  contract
}: TableActionButtonProps) {

  const { access: createAccess } = useAccess("CONTRACT", "CREATE");
  const { access: modifyAccess } = useAccess("CONTRACT", "MODIFY");

  const isFullyRestricted =
    !createAccess &&
    !modifyAccess;


  const { mutate: mutateExportToClientContract, isPending: isExportingClientContract } =
    useQueryAction<{ contractId: string }, { status: string, message: string }>(
      exportClientContractToWord,
      () => { },
      "client-contract",
    );

  const { mutate: mutateExportToLessorContract, isPending: isExportingLessorContract } =
    useQueryAction<{ contractId: string }, { status: string, message: string }>(
      exportLessorContractToWord,
      () => { },
      "lessor-contract",
    );

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<null>
  >(removeContract, () => { }, "contracts");

  function convertToWord(id: string, action: "duplicate" | "convert") {
    id
    switch (action) {
      case "convert":
        mutateExportToClientContract({ contractId: id }, {
          onSuccess(data) {
            toast.success(data.message);
          },
          onError(error) {
            toast.error("Erreur lors de l'export du contrat");
            console.error(error);
          }
        });
        break;
      case "duplicate":
        mutateExportToLessorContract({ contractId: id }, {
          onSuccess(data) {
            toast.success(data.message);
          },
          onError(error) {
            toast.error("Erreur lors de l'export du contrat");
            console.error(error);
          }
        });
        break;
    }

  }

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            refreshContract();
          },
        }
      );
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" disabled={isFullyRestricted} className="p-0 rounded-lg !w-9 !h-9">
          <ChevronDownIcon className="text-white" />
        </Button>
      </PopoverTrigger>
      {!isFullyRestricted &&
        <PopoverContent align="end" className="p-0 w-[180px]">
          <ul>
            {menus.map((menu) => {
              if (contract === "CLIENT" && menu.action === "duplicate") return null;
              if (contract === "LESSOR" && menu.action === "convert") return null;

              if (
                (["convert", "duplicate"].includes(menu.action as string) &&
                  !createAccess)
              )
                return null;
              if (menu.action === "delete" && !modifyAccess) return null;

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
                      <button
                        className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                        onClick={() => convertToWord(id, menu.action as "duplicate" | "convert")}
                      >
                        <menu.icon className="w-4 h-4" />
                        {menu.title}
                        {menu.action === "duplicate" && isExportingClientContract && <Spinner size={10} />}
                        {menu.action === "convert" && isExportingLessorContract && <Spinner size={10} />}
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
