// BillboardSendEmailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import BillboardSendEmailForm from "./billboard-send-email-form";

type BillboardSendEmailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function BillboardSendEmailModal({
  open,
  onOpenChange,
}: BillboardSendEmailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[950px]">
        <DialogHeader>
          <DialogTitle>Envoyer au client</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <BillboardSendEmailForm close={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
