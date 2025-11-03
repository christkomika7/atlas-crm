'use client';

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
import { duplicationProductService, remove } from "@/action/product-service.action";
import { ProductServiceType } from "@/types/product-service.types";
import { $Enums } from "@/lib/generated/prisma";
import ProductServiceEditModal from "./product-service-edit-modal";
import Spinner from "@/components/ui/spinner";
import { useState } from "react";

type TableActionButtonProps = {
  id: string;
  menus: TableActionButtonType[];
  deleteTitle: string;
  deleteMessage: string | React.ReactNode;
  refreshProductServices: () => void;
  filter: $Enums.ProductServiceType;
};

export default function TableActionButton({
  menus,
  id,
  deleteTitle,
  deleteMessage,
  refreshProductServices,
  filter,
}: TableActionButtonProps) {

  const [currentId, setCurrentId] = useState("");
  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<ProductServiceType[]>
  >(remove, () => { }, "product-services");


  const { mutate: mutateDuplicate, isPending: isDuplicating } = useQueryAction<
    { id: string },
    RequestResponse<ProductServiceType>
  >(duplicationProductService, () => { }, "product-services");

  function handleDelete() {
    if (id) {
      mutate(
        { id },
        {
          onSuccess() {
            refreshProductServices();
          },
        }
      );
    }
  }


  function duplicate(menuId: string) {
    setCurrentId(menuId)

    if (id) {
      mutateDuplicate(
        { id },
        {
          onSuccess() {
            setCurrentId("")
            refreshProductServices();
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
            if (menu.action === "duplicate")
              return (
                <li key={menu.id}>
                  <button onClick={() => duplicate(String(menu.id))} className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer">
                    {<menu.icon className="w-4 h-4" />}
                    {menu.title}
                    {currentId === menu.id && isDuplicating && <Spinner />}
                  </button>
                </li>
              );
            return (
              <li key={menu.id}>
                <ProductServiceEditModal
                  id={id}
                  title={menu.title}
                  filter={filter}
                  onProductServiceUpdated={refreshProductServices}
                />
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
