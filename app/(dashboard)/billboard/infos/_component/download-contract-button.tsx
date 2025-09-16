"use client";
import { Button } from "@/components/ui/button";
import useTabStore from "@/stores/tab.store";
import { DownloadIcon } from "lucide-react";
import BillboardCreateContractModal from "../../_component/billboard-create-contract-modal";

export default function DownloadContractButton() {
  const tabs = useTabStore.use.tabs();

  if (tabs["billboard-details-tab"] === 0) return;
  return (
    <BillboardCreateContractModal>
      <Button variant="primary" className="w-fit">
        <DownloadIcon />
        Télécharger le contrat
      </Button>
    </BillboardCreateContractModal>
  );
}
