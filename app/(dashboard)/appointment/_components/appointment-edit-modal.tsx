import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditIcon, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import AppointmentEditForm from "./appointment-edit-form";
import { AppointmentType } from "@/types/appointment.type";

type AppointmentCreateModalProps = {
  onAppointmentAdded?: () => void;
  id: string;
  title: string;
};

export default function AppointmentsEditModal({
  onAppointmentAdded,
  id,
  title,
}: AppointmentCreateModalProps) {
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
          <DialogTitle>Modification du rendez-vous</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AppointmentEditForm
          closeModal={setOpen}
          onAppointmentAdded={onAppointmentAdded}
          id={id}
        />
      </DialogContent>
    </Dialog>
  );
}
