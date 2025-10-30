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
import { removeContract } from "@/action/contract.action";
import { $Enums } from "@/lib/generated/prisma";
import ClientContractEdit from "./client-contract-edit";
import LessorContractEdit from "./lessor-contract-edit";
import ModalContainer from "@/components/modal/modal-container";
import { SetStateAction, useState } from "react";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  contract: $Enums.ContractType;
  deleteMessage: string | React.ReactNode;
  refreshContract: () => void;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshContract,
  contract
}: TableActionButtonProps) {

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<null>
  >(removeContract, () => { }, "contracts");

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

  function goto(id: string) {
    return router.push(`/contract/${id}/${contract}`);
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
            if (menu.action === "infos") {
              return <li key={menu.id}>
                <button
                  className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer"
                  onClick={() => goto(id)}
                >
                  <menu.icon className="w-4 h-4" />
                  {menu.title}
                </button>
              </li>
            }
            if (menu.action === "delete") {
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

            }
            if (menu.action === "update") {
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
                    title={`Modifier le contrat du ${contract === "CLIENT" ? "client" : "bailleur"}`}
                    open={open}
                    setOpen={function (value: SetStateAction<boolean>): void {
                      setOpen(value);
                    }}
                  >
                    {
                      contract === "CLIENT" ?
                        <ClientContractEdit id={id}
                          refreshContract={refreshContract}
                          closeModal={() => setOpen(false)}
                        /> :
                        <LessorContractEdit id={id}
                          refreshContract={refreshContract}
                          closeModal={() => setOpen(false)}
                        />
                    }
                  </ModalContainer>
                </li>
              );
            }
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
