import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import BillboardSendEmailModal from "./billboard-send-email-modal";
import BillboardCreateBrochureForm from "./billboard-create-brochure-form";

type BillboardBrochureModalProps = {
  children: React.ReactNode;
};

export default function BillboardBrochureModal({
  children,
}: BillboardBrochureModalProps) {
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const handleSendEmail = () => {
    setEmailModalOpen(true);
  };

  return (
    <>
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="min-w-[950px]">
          <DialogHeader>
            <DialogTitle>Selectionner les critères</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <BillboardCreateBrochureForm
            close={() => setContractModalOpen(false)}
            onSendEmail={handleSendEmail}
          />
        </DialogContent>
      </Dialog>

      <BillboardSendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />
    </>
  );
}
