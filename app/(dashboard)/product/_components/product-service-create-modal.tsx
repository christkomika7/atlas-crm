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
import ProductServiceForm from "./product-service-form";

type ProductServiceCreateModalProps = {
  onProductServiceAdded?: () => void;
};

export default function ProductServiceCreateModal({
  onProductServiceAdded,
}: ProductServiceCreateModalProps) {
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
          produit | service
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>Nouveau produit | service</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ProductServiceForm
          closeModal={setOpen}
          onProductServiceAdded={onProductServiceAdded}
        />
      </DialogContent>
    </Dialog>
  );
}
