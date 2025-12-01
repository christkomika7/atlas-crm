"use client";

import { getCategories, getNaturesByCompanyId, getSourcesByCompany } from "@/action/transaction.action";
import { getCollaborators } from "@/action/user.action";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { MultipleSelect } from "@/components/ui/multi-select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment, movements } from "@/lib/data";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { SourceType, TransactionCategoryType, TransactionNatureType } from "@/types/transaction.type";
import { ProfileType } from "@/types/user.types";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type TransactionFiltersProps = {
  filters: "empty" | "filter" | "reset";
  setFilters: Dispatch<SetStateAction<"empty" | "filter" | "reset">>;
};

export default function TransactionFilters({ filters, setFilters }: TransactionFiltersProps) {
  const router = useRouter();
  const isResetting = useRef(false);

  const companyId = useDataStore.use.currentCompany();

  const categories = useTransactionStore.use.categories();
  const setCategories = useTransactionStore.use.setCategories();

  const natures = useTransactionStore.use.natures();
  const setNatures = useTransactionStore.use.setNatures();

  const sources = useTransactionStore.use.sources();
  const setSources = useTransactionStore.use.setSources();

  const [movementValue, setMovementValue] = useState<string[]>([]);
  const [categoryValue, setCategoryValue] = useState<string[]>([]);
  const [natureValue, setNatureValue] = useState<string[]>([]);
  const [sourceValue, setSourceValue] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<ProfileType[]>([]);
  const [paymentModeValue, setPaymentModeValue] = useState<string[]>([]);
  const [paidForValue, setPaidForValue] = useState<string>("");

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { mutate: mutateGetCategories, isPending: isGettingCategories } =
    useQueryAction<{ companyId: string; filter?: boolean }, RequestResponse<TransactionCategoryType[]>>(
      getCategories,
      () => { },
      "categories"
    );

  const { mutate: mutateGetNatures, isPending: isGettingNatures } =
    useQueryAction<{ companyId: string; filter?: boolean }, RequestResponse<TransactionNatureType[]>>(
      getNaturesByCompanyId,
      () => { },
      "natures"
    );

  const { mutate: mutateGetSources, isPending: isGettingSources } =
    useQueryAction<{ companyId: string; filter?: boolean }, RequestResponse<SourceType[]>>(
      getSourcesByCompany,
      () => { },
      "sources"
    );

  const { mutate: mutateGetCollaborators, isPending: isGettingCollaborators } =
    useQueryAction<{ id: string }, RequestResponse<ProfileType[]>>(
      getCollaborators,
      () => { },
      "collaborators"
    );

  useEffect(() => {
    if (companyId) {
      mutateGetCategories({ companyId, filter: true }, { onSuccess: data => data.data && setCategories(data.data) });
      mutateGetNatures({ companyId, filter: true }, { onSuccess: data => data.data && setNatures(data.data) });
      mutateGetSources({ companyId, filter: true }, { onSuccess: data => data.data && setSources(data.data) });
      mutateGetCollaborators({ id: companyId }, { onSuccess: data => data.data && setCollaborators(data.data) });
    }
  }, [companyId]);

  useEffect(() => {
    if (filters === "reset") {
      isResetting.current = true;
      setMovementValue([]);
      setCategoryValue([]);
      setNatureValue([]);
      setPaymentModeValue([]);
      setSourceValue([]);
      setPaidForValue("");
      setStartDate(undefined);
      setEndDate(undefined);

      router.replace("/transaction");

      setTimeout(() => {
        setFilters("empty");
        isResetting.current = false;
      }, 100);
    }
  }, [filters]);

  useEffect(() => {
    if (isResetting.current) return;

    const params = new URLSearchParams();

    if (movementValue.length) params.set("movement", movementValue.join(","));
    if (categoryValue.length) params.set("category", categoryValue.join(","));
    if (natureValue.length) params.set("nature", natureValue.join(","));
    if (paymentModeValue.length) params.set("paymentMode", paymentModeValue.join(","));
    if (sourceValue.length) params.set("source", sourceValue.join(","));
    if (paidForValue) params.set("paidFor", paidForValue);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    const queryString = params.toString();
    const url = queryString ? `/transaction?${queryString}` : "/transaction";

    const hasActiveFilters =
      movementValue.length || categoryValue.length || natureValue.length ||
      paymentModeValue.length || sourceValue.length || paidForValue || startDate || endDate;

    setFilters(hasActiveFilters ? "filter" : "empty");
    router.replace(url);
  }, [movementValue, categoryValue, natureValue, paymentModeValue, sourceValue, paidForValue, startDate, endDate]);

  return (
    <ScrollArea className="w-full overflow-x-auto">
      <div className="flex items-center gap-x-2 w-max py-2.5 pr-2">
        <DatePicker label="Date de début" mode="single" className="w-[200px]" value={startDate} onChange={d => setStartDate(d as Date)} />
        <DatePicker label="Date de fin" mode="single" className="w-[200px]" value={endDate} onChange={d => setEndDate(d as Date)} />

        <MultipleSelect
          className="w-[250px]"
          label="Mouvement"
          options={movements}
          value={movements.filter(opt => movementValue.includes(opt.value))}
          onChange={opts => setMovementValue(opts.map(opt => opt.value))}
          placeholder="Recherche mouvements"
        />

        <MultipleSelect
          className="w-[250px]"
          isLoading={isGettingCategories}
          label="Catégorie"
          options={categories.map(c => ({ id: c.id, label: c.name, value: c.id }))}
          value={categories.map(c => ({ id: c.id, label: c.name, value: c.id })).filter(opt => categoryValue.includes(opt.value))}
          onChange={opts => setCategoryValue(opts.map(opt => opt.value))}
          placeholder="Recherche catégories"
        />

        <MultipleSelect
          className="w-[250px]"
          isLoading={isGettingNatures}
          label="Nature"
          options={natures.map(n => ({ id: n.id, label: n.name, value: n.id }))}
          value={natures.map(n => ({ id: n.id, label: n.name, value: n.id })).filter(opt => natureValue.includes(opt.value))}
          onChange={opts => setNatureValue(opts.map(opt => opt.value))}
          placeholder="Recherche natures"
        />

        <MultipleSelect
          className="w-[250px]"
          label="Mode paiement"
          options={acceptPayment}
          value={acceptPayment.filter(opt => paymentModeValue.includes(opt.value))}
          onChange={opts => setPaymentModeValue(opts.map(opt => opt.value))}
          placeholder="Recherche mode de paiement"
        />

        <MultipleSelect
          className="w-[250px]"
          isLoading={isGettingSources}
          label="Source"
          options={sources.map(s => ({ id: s.id, label: s.name, value: s.id }))}
          value={sources.map(s => ({ id: s.id, label: s.name, value: s.id })).filter(opt => sourceValue.includes(opt.value))}
          onChange={opts => setSourceValue(opts.map(opt => opt.value))}
          placeholder="Recherche sources"
        />

        <Combobox
          className="w-[250px]"
          isLoading={isGettingCollaborators}
          datas={collaborators.map(c => ({ id: c.id, label: `${c.firstname} ${c.lastname}`, value: c.id }))}
          value={paidForValue}
          setValue={setPaidForValue}
          required={false}
          placeholder="Payé pour le compte"
          searchMessage="Rechercher un compte"
          noResultsMessage="Aucun compte trouvé."
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
