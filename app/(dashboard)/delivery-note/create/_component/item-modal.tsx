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
import ItemForm from "./item-form";

export default function ItemModal() {
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
          Ajout article
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>Article</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ItemForm />
      </DialogContent>
    </Dialog>
  );
}
