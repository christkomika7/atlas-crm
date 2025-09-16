import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

export default function TransactionFilters() {
  const [mouvementValue, setMouvementValue] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [paymentModeValue, setPaymentModeValue] = useState<string>("");
  const [sourceValue, setSourceValue] = useState<string>("");
  const [paidForValue, setPaidForValue] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return (
    <ScrollArea className="pb-2 w-full overflow-x-auto">
      <div className="flex items-center gap-x-2 w-max">
        <DatePicker
          label="Date de début"
          mode="single"
          value={startDate}
          disabled={false}
          onChange={(date) => setStartDate(date as Date)}
        />
        <DatePicker
          label="Date de fin"
          mode="single"
          value={endDate}
          disabled={false}
          onChange={(date) => setEndDate(date as Date)}
        />
        <Combobox
          datas={[]}
          required={false}
          value={mouvementValue}
          setValue={setMouvementValue}
          placeholder="Mouvement"
          searchMessage="Rechercher un mouvement"
          noResultsMessage="Aucun mouvement trouvé."
        />
        <Combobox
          datas={[]}
          required={false}
          value={categoryValue}
          setValue={setCategoryValue}
          placeholder="Catégorie"
          searchMessage="Rechercher une catégorie"
          noResultsMessage="Aucune catégorie trouvée."
        />
        <Combobox
          datas={[]}
          required={false}
          value={paymentModeValue}
          setValue={setPaymentModeValue}
          placeholder="Mode de paiement"
          searchMessage="Rechercher un mode de paiement"
          noResultsMessage="Aucun mode de paiement trouvé."
        />
        <Combobox
          datas={[]}
          required={false}
          value={sourceValue}
          setValue={setSourceValue}
          placeholder="Source"
          searchMessage="Rechercher une source"
          noResultsMessage="Aucune source trouvée."
        />
        <Combobox
          datas={[]}
          required={false}
          value={paidForValue}
          setValue={setPaidForValue}
          placeholder="Payé pour le compte de"
          searchMessage="Rechercher un compte"
          noResultsMessage="Aucun compte trouvé."
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
