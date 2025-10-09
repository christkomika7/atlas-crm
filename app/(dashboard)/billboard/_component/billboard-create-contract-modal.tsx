// BillboardCreateContractModal.tsx
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
import BillboardCreateContractForm from "./billboard-create-contract-form";
import BillboardSendEmailModal from "./billboard-send-email-modal";

type BillboardCreateContractModalProps = {
  children: React.ReactNode;
};

export default function BillboardCreateContractModal({
  children,
}: BillboardCreateContractModalProps) {
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const handleSendEmail = () => {
    setEmailModalOpen(true);
  };

  return (
    <>
      {/* Modal de sélection des critères */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="min-w-[950px]">
          <DialogHeader>
            <DialogTitle>Selectionner les critères</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <BillboardCreateContractForm
            close={() => setContractModalOpen(false)}
            onSendEmail={handleSendEmail}
          />
        </DialogContent>
      </Dialog>

      {/* Modal d'envoi d'email */}
      <BillboardSendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />
    </>
  );
}
