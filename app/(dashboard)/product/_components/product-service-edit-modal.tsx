import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";
import React, { useState } from "react";
import AppointmentEditForm from "./product-service-edit-form";
import { $Enums } from "@/lib/generated/prisma";

type ProductServiceEditModalProps = {
  onProductServiceUpdated?: () => void;
  id: string;
  title: string;
  filter: $Enums.ProductServiceType;
};

export default function ProductServiceEditModal({
  onProductServiceUpdated,
  id,
  title,
  filter,
}: ProductServiceEditModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-x-2 hover:bg-neutral-50 px-4 py-3 w-full font-medium text-sm cursor-pointer">
          <EditIcon className="w-4 h-4" />
          {title}
        </button>
      </DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>
            Modification le {filter === "PRODUCT" ? "produit" : "service"}{" "}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AppointmentEditForm
          closeModal={setOpen}
          onProductServiceUpdated={onProductServiceUpdated}
          id={id}
        />
      </DialogContent>
    </Dialog>
  );
}
