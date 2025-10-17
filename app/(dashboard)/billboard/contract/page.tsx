"use client";
import BoardRentContract from "../_component/brochure-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BilloardRentContractPage() {
  const data = {
    companyName: "Total Energie (TE)",
    type: "SA",
    capital: "5.000.000 Francs CFA",
    rccm: "12345678902",
    taxIdentificationNumber: "09876543212",
    address: "39 rue de la place, à Libreville, Gabon.",
    AdvertiserName: "Paul Dupin",
    AdvertiserPost: "Directeur Général",
    reference: "Contrat AG-LOC-001",
  };
  return (
    <ScrollArea className="w-full h-svh">
      <div className="flex justify-center space-y-4 pt-10 h-full">
        <BoardRentContract data={data} />
      </div>
    </ScrollArea>
  );
}
