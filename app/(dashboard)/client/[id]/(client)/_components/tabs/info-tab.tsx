import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import { useAccess } from "@/hook/useAccess";
import { downloadFile } from "@/lib/utils";
import useClientStore from "@/stores/client.store";
import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function InfoTab() {
  const router = useRouter();
  const client = useClientStore.use.client();

  const modifyAccess = useAccess("CLIENTS", "MODIFY");

  function gotTo() {
    if (client?.id) {
      router.push(`/client/edit/${client.id}`);
    }
  }

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {modifyAccess && (
        <Button
          variant="inset-primary"
          className="flex-shrink-0 bg-transparent w-fit"
          onClick={gotTo}
        >
          Modifier
        </Button>
      )}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="space-y-5 p-4 max-w-2xl">
            <TextInput
              design="float"
              label="Nom de l'entreprise"
              value={client?.companyName}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Nom"
              value={client?.lastname}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Prénom"
              value={client?.firstname}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Poste"
              value={client?.job}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Capital"
              value={client?.capital}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro de téléphone"
              value={client?.phone}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Adresse email"
              value={client?.email}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Secteur d'activité"
              value={client?.businessSector}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Statut juridique"
              value={client?.legalForms}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Site internet"
              value={client?.website}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Adresse enregistrée"
              value={client?.address}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro d'immatriculation (RCCM)"
              value={client?.businessRegistrationNumber}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro d'identification fiscale (NIF)"
              value={client?.taxIdentificationNumber}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Réduction"
              value={client?.discount}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Conditions de paiement"
              value={client?.paymentTerms}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Information supplémentaire"
              value={client?.information}
              disabled={true}
              handleChange={() => { }}
            />
            <ul className="space-y-1 bg-gray p-4 border rounded-md w-full text-sm">
              {client?.uploadDocuments && client.uploadDocuments.length > 0 ? (
                client.uploadDocuments.map((document, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                  >
                    {document.split("/").pop()}
                    <span
                      onClick={() => downloadFile(document)}
                      className="text-blue cursor-pointer"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm">Aucun document trouvé.</li>
              )}
            </ul>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}