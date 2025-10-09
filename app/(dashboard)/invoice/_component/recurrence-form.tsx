"use client";
import { createRecurrence } from "@/action/invoice.action";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { recurrences } from "@/lib/data";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { RecurrenceType } from "@/types/invoice.types";
import { useState } from "react";
import { toast } from "sonner";

type RecurrenceFormProps = {
  invoiceId: string;
  closeModal: () => void;
}

export default function RecurrenceForm({ invoiceId, closeModal }: RecurrenceFormProps) {
  const [recurrence, setRecurrence] = useState("no");
  const companyId = useDataStore.use.currentCompany()

  const { mutate: mutateCreateRecurrence, isPending: isCreatingRecurrence } = useQueryAction<
    RecurrenceType,
    RequestResponse<null>
  >(createRecurrence, () => { }, "recurrence");

  function validate() {
    if (!invoiceId) return toast.error("La facture est introuvable");
    if (!companyId) return toast.error("L'entreprise est introuvable");

    mutateCreateRecurrence({ companyId, invoiceId, repeat: recurrence }, {
      onSuccess() {
        closeModal()
      },
    })
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Combobox
        className="w-full"
        datas={recurrences}
        value={recurrence}
        setValue={setRecurrence}
        placeholder="Sélectionner une récurrence"
        searchMessage="Rechercher une récurrence"
        noResultsMessage="Aucune récurrence trouvée."
      />
      <div className="flex justify-center gap-x-4 w-full">
        <Button onClick={() => setRecurrence("no")} variant="primary" className="bg-gray text-dark">
          Reinitialiser
        </Button>
        <Button onClick={e => {
          e.preventDefault();
          validate()
        }} variant="primary">
          {isCreatingRecurrence ? <Spinner /> : "Valider"}
        </Button>
      </div>
    </div>
  );
}
