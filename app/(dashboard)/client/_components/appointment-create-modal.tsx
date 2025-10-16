import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import AppointmentForm from "../../appointment/_components/appointment-form";

export default function AppointmentsCreateModal() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant="primary"
          className="w-fit font-medium"
        >
          Nouveau rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>Nouveau rendez-vous</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AppointmentForm closeModal={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
