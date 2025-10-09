import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import SupplierForm from "./supplier-form";

type SuppliersCreateModalProps = {
  onSupplierAdded?: () => void;
};

export default function SuppliersCreateModal({
  onSupplierAdded,
}: SuppliersCreateModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant="primary"
          className="w-fit font-medium"
        >
          <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Ajouter un
          fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>Nouveau fournisseur</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <SupplierForm closeModal={setOpen} onSupplierAdded={onSupplierAdded} />
      </DialogContent>
    </Dialog>
  );
}
