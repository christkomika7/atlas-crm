"use client";
import AccessContainer from "@/components/errors/access-container";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import { useAccess } from "@/hook/useAccess";
import { downloadFile } from "@/lib/utils";
import useSupplierStore from "@/stores/supplier.store";
import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function InfoTab() {
  const router = useRouter();
  const supplier = useSupplierStore.use.supplier();

  const readAccess = useAccess("SUPPLIERS", "READ");
  const modifyAccess = useAccess("SUPPLIERS", "MODIFY");


  function gotTo() {
    if (supplier?.id) {
      router.push(`/supplier/edit/${supplier.id}`);
    }
  }

  return (
    <div className="flex flex-col pt-3 h-full">
      {modifyAccess &&
        <Button
          variant="inset-primary"
          className="flex-shrink-0 bg-transparent mb-4 w-fit"
          onClick={gotTo}
        >
          Modifier
        </Button>
      }
      <AccessContainer hasAccess={readAccess} resource="SUPPLIERS">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-5 py-4 pr-2 max-w-2xl">
            <TextInput
              design="float"
              label="Nom de l'entreprise"
              value={supplier?.companyName}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Nom"
              value={supplier?.lastname}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Prénom"
              value={supplier?.firstname}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Poste"
              value={supplier?.job}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Capital"
              value={supplier?.capital}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro de téléphone"
              value={supplier?.phone}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Adresse email"
              value={supplier?.email}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Secteur d'activité"
              value={supplier?.businessSector}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Statut juridique"
              value={supplier?.legalForms}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Site internet"
              value={supplier?.website}
              disabled={true}
              handleChange={() => { }}
            />

            <TextInput
              design="float"
              label="Adresse enregistrée"
              value={supplier?.address}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro d'immatriculation (RCCM)"
              value={supplier?.businessRegistrationNumber}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Numéro d'identification fiscale (NIF)"
              value={supplier?.taxIdentificationNumber}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Réduction"
              value={supplier?.discount}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Conditions de paiement"
              value={supplier?.paymentTerms}
              disabled={true}
              handleChange={() => { }}
            />
            <TextInput
              design="float"
              label="Information supplémentaire"
              value={supplier?.information}
              disabled={true}
              handleChange={() => { }}
            />
            <ul className="space-y-1 bg-gray p-4 border rounded-md w-full text-sm">
              {supplier?.uploadDocuments &&
                supplier.uploadDocuments.length > 0 ? (
                supplier.uploadDocuments.map((document, index) => {
                  return (
                    <li
                      key={index}
                      className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                    >
                      {document.split("/").pop()}{" "}
                      <span
                        onClick={() => downloadFile(document)}
                        className="text-blue cursor-pointer"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </span>{" "}
                    </li>
                  );
                })
              ) : (
                <li className="text-sm">Aucun document trouvé.</li>
              )}
            </ul>
          </div>
        </ScrollArea>
      </AccessContainer>
    </div>
  );
}
