import { getCategories, getSources } from "@/action/transaction.action";
import { getCollaborators } from "@/action/user.action";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment, movements } from "@/lib/data";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { SourceType, TransactionCategoryType } from "@/types/transaction.type";
import { UserType } from "@/types/user.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransactionFilters() {
  const router = useRouter();

  const companyId = useDataStore.use.currentCompany();

  const categories = useTransactionStore.use.categories();
  const setCategories = useTransactionStore.use.setCategories();
  const sources = useTransactionStore.use.sources();
  const setSources = useTransactionStore.use.setSources();

  const [movementValue, setMovementValue] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [paymentModeValue, setPaymentModeValue] = useState<string>("");
  const [sourceValue, setSourceValue] = useState<string>("");
  const [paidForValue, setPaidForValue] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [collaborators, setCollaborators] = useState<UserType[]>([]);

  const { mutate: mutateGetCategories, isPending: isGettingCategories } =
    useQueryAction<
      { companyId: string },
      RequestResponse<TransactionCategoryType[]>
    >(getCategories, () => {}, "categories");

  const { mutate: mutateGetSources, isPending: isGettingSources } =
    useQueryAction<{ companyId: string }, RequestResponse<SourceType[]>>(
      getSources,
      () => {},
      "sources",
    );

  const { mutate: mutateGetCollborators, isPending: isGettingCollaborators } =
    useQueryAction<{ id: string }, RequestResponse<UserType[]>>(
      getCollaborators,
      () => {},
      "collaborators",
    );

  useEffect(() => {
    if (companyId) {
      mutateGetCategories(
        { companyId },
        {
          onSuccess(data) {
            if (data.data) {
              setCategories(data.data);
            }
          },
        },
      );

      mutateGetSources(
        { companyId },
        {
          onSuccess(data) {
            if (data.data) {
              setSources(data.data);
            }
          },
        },
      );

      mutateGetCollborators(
        { id: companyId },
        {
          onSuccess(data) {
            if (data.data) {
              setCollaborators(data.data);
            }
          },
        },
      );
    }
  }, [companyId]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (movementValue) params.set("movement", movementValue);
    if (categoryValue) params.set("category", categoryValue);
    if (paymentModeValue) params.set("paymentMode", paymentModeValue);
    if (sourceValue) params.set("source", sourceValue);
    if (paidForValue) params.set("paidFor", paidForValue);
    if (startDate) params.set("startDate", startDate.toISOString());
    if (endDate) params.set("endDate", endDate.toISOString());

    const queryString = params.toString();
    const url = queryString ? `/transaction?${queryString}` : "/transaction";

    router.replace(url);
  }, [
    movementValue,
    categoryValue,
    paymentModeValue,
    sourceValue,
    paidForValue,
    startDate,
    endDate,
    router,
  ]);

  return (
    <ScrollArea className="w-full overflow-x-auto">
      <div className="flex items-center gap-x-2 w-max py-2.5 pr-2 ">
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
          datas={movements}
          required={false}
          value={movementValue}
          setValue={setMovementValue}
          placeholder="Mouvement"
          searchMessage="Rechercher un mouvement"
          noResultsMessage="Aucun mouvement trouvé."
        />
        <Combobox
          isLoading={isGettingCategories}
          datas={categories.map((category) => ({
            id: category.id,
            label: category.name,
            value: category.id,
          }))}
          required={false}
          value={categoryValue}
          setValue={setCategoryValue}
          placeholder="Catégorie"
          searchMessage="Rechercher une catégorie"
          noResultsMessage="Aucune catégorie trouvée."
        />
        <Combobox
          datas={acceptPayment}
          required={false}
          value={paymentModeValue}
          setValue={setPaymentModeValue}
          placeholder="Mode de paiement"
          searchMessage="Rechercher un mode de paiement"
          noResultsMessage="Aucun mode de paiement trouvé."
        />
        <Combobox
          isLoading={isGettingSources}
          datas={sources.map((source) => ({
            id: source.id,
            label: source.name,
            value: source.id,
          }))}
          required={false}
          value={sourceValue}
          setValue={setSourceValue}
          placeholder="Source"
          searchMessage="Rechercher une source"
          noResultsMessage="Aucune source trouvée."
        />
        <Combobox
          isLoading={isGettingCollaborators}
          datas={collaborators.map((collaborator) => ({
            id: collaborator.id,
            label: collaborator.name,
            value: collaborator.id,
          }))}
          required={false}
          value={paidForValue}
          setValue={setPaidForValue}
          placeholder="Payé pour le compte"
          searchMessage="Rechercher un compte"
          noResultsMessage="Aucun compte trouvé."
        />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
