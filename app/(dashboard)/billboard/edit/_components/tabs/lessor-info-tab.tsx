import { all } from "@/action/supplier.action";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment, electricitySupply, lessorSpaceType, paymentFrequency, rentalDurations } from "@/lib/data";
import {
  EditBillboardSchemaFormType,
  lessorError,
  LessorErrorType,
} from "@/lib/zod/billboard.schema";
import useBillboardStore from "@/stores/billboard.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { SupplierType } from "@/types/supplier.types";
import { all as allCities } from "@/action/city.action";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Decimal } from "decimal.js"
import useCityStore from "@/stores/city.store";
import { getBillboardLessorType } from "@/action/billboard.action";
import { BaseType } from "@/types/base.types";
import { CityType } from "@/types/city.types";
import { MultipleSelect } from "@/components/ui/multi-select";
import LessorTypeModal from "@/components/modal/lessor-type-modal";
import CityModal from "../../../_component/city-modal";
import { MORAL_COMPANY, PHYSICAL_COMPANY } from "@/config/constant";
import { Section } from "@/components/ui/section";
import { TextField } from "@/components/ui/text-field";

type LessorInfoTabProps = {
  form: UseFormReturn<EditBillboardSchemaFormType>;
};

export default function LessorInfoTab({
  form,
}: LessorInfoTabProps) {
  const companyId = useDataStore.use.currentCompany()
  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();
  const currentSpaceType = useBillboardStore.use.currentSpaceType?.();

  const lessorTypes = useBillboardStore.use.lessorTypes();
  const setLessorType = useBillboardStore.use.setLessorType();

  const setCities = useCityStore.use.setCity();
  const cities = useCityStore.use.cities();

  const [suppliers, setSupplier] = useState<SupplierType[]>([]);
  const [lessorTypeName, setLessorTypeName] = useState("");


  const { mutate: mutateGetSuppliers, isPending: isGettingSuppliers } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType[]>
  >(all, () => { }, "suppliers");


  const {
    mutate: mutateCity,
    isPending: isPendingCity,
    data: dataCities,
  } = useQueryAction<{ companyId: string }, RequestResponse<CityType[]>>(
    allCities,
    () => { },
    "cities"
  );

  const {
    mutate: mutateGetElements,
    isPending: isGettingElements,
  } = useQueryAction<
    { companyId: string },
    RequestResponse<BaseType[]>
  >(getBillboardLessorType, () => { }, "lessor-type");


  useEffect(() => {
    if (companyId) {
      mutateGetSuppliers({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setSupplier(data.data);
          }
        },
      });

      mutateGetElements({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLessorType(data.data);
          }
        },
      });

      mutateCity({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setCities(data.data);
          }
        },
      });
    }
  }, [companyId]);

  const handleLessorTypeChange = (id: string) => {
    const name = lessorTypes.find((l) => l.id === id)?.name || "";
    setLessorTypeName(name);
  };

  const isPrivate = currentSpaceType === "private";
  const isPublic = currentSpaceType === "public";
  const isPhysical = lessorTypeName === PHYSICAL_COMPANY;
  const isMoral = lessorTypeName === MORAL_COMPANY;


  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-6 mx-2 my-4 max-w-xl">
        <FormField
          control={form.control}
          name="lessor"
          render={({ fieldState }) => (
            <FormItem className="w-full">
              <FormControl></FormControl>
              {fieldState.error && (
                <ul className="bg-red/5 p-2 rounded-lg w-full text-red text-xs">
                  La section bailleur présente des erreurs, veuillez vérifier les champs suivants :
                  {Object.entries(fieldState.error).map(([field], index) => (
                    <li key={index} className="mt-1">
                      • <span className="font-medium">{lessorError[field as keyof LessorErrorType]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </FormItem>
          )}
        />

        <Section title="Informations sur le bailleur">
          <FormField
            control={form.control}
            name="lessor.lessorSpaceType"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <Combobox
                    datas={lessorSpaceType}
                    value={currentSpaceType || ""}
                    setValue={(e) => {
                      setCurrentSpaceType(e as "private" | "public");
                      field.onChange(String(e));
                    }}
                    placeholder="Type d'espace"
                    searchMessage="Rechercher un type d'espace"
                    noResultsMessage="Aucun type d'espace trouvé."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lessor.lessorType"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <Combobox
                    isLoading={isGettingElements}
                    datas={lessorTypes.map((lessorType) => ({
                      id: lessorType.id,
                      label: lessorType.name,
                      value: lessorType.id,
                    }))}
                    value={field.value as string}
                    setValue={(e) => {
                      handleLessorTypeChange(String(e));
                      field.onChange(String(e));
                    }}
                    placeholder="Type de bailleur"
                    searchMessage="Rechercher un type"
                    noResultsMessage="Aucun type de bailleur trouvé."
                    addElement={<LessorTypeModal lessorSpaceType={currentSpaceType} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isPrivate && (
            <>
              <TextField control={form.control} name="lessor.locationPrice" label="Prix du panneau loué" type="number" />
              <TextField control={form.control} name="lessor.nonLocationPrice" label="Prix du panneau non loué" type="number" />
            </>
          )}

          {isPublic && (
            <FormField
              control={form.control}
              name="lessor.lessorCustomer"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingSuppliers}
                      datas={suppliers.map((supplier) => ({
                        id: supplier.id,
                        label: `${supplier.companyName} - ${supplier.firstname} ${supplier.lastname}`,
                        value: supplier.id,
                      }))}
                      value={field.value as string}
                      setValue={(e) => field.onChange(String(e))}
                      placeholder="Bailleur"
                      searchMessage="Rechercher un bailleur"
                      noResultsMessage="Aucun bailleur trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isPrivate && (
            <>
              <TextField control={form.control} name="lessor.lessorName" label="Nom du bailleur" />
              <TextField control={form.control} name="lessor.lessorAddress" label="Adresse complète du bailleur" />

              <FormField
                control={form.control}
                name="lessor.lessorCity"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        isLoading={isPendingCity}
                        datas={cities.map((city) => ({
                          id: city.id,
                          label: city.name,
                          value: city.id,
                        }))}
                        value={field.value as string}
                        setValue={e => field.onChange(String(e))}
                        placeholder="Ville"
                        searchMessage="Rechercher une ville"
                        noResultsMessage="Aucune ville trouvée."
                        addElement={<CityModal />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextField control={form.control} name="lessor.lessorPhone" label="Numéro de téléphone du bailleur" />
              <TextField control={form.control} name="lessor.lessorEmail" label="Adresse mail du bailleur" />

              {isPhysical && (
                <>
                  <TextField control={form.control} name="lessor.identityCard" label="Numéro carte d'identité" required={false} />
                </>
              )}

              {isMoral && (
                <>
                  <FormField
                    control={form.control}
                    name="lessor.capital"
                    render={({ field }) => (
                      <FormItem className="-space-y-2">
                        <FormControl>
                          <TextInput
                            type="number"
                            design="float"
                            label="Capital du bailleur"
                            value={field.value?.toString() || "0"}
                            handleChange={(e) => field.onChange(new Decimal(String(e)))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField control={form.control} name="lessor.rccm" label="Registre du commerce (RCCM)" />
                  <TextField control={form.control} name="lessor.taxIdentificationNumber" label="Numéro d'identification fiscale" />
                  <TextField control={form.control} name="lessor.niu" label="NIU" required={false} />
                  <TextField control={form.control} name="lessor.legalForms" label="Statut juridique" />
                </>
              )}
            </>
          )}
        </Section>

        {isPrivate && (
          <Section title="Information sur la banque">
            <TextField control={form.control} name="lessor.bankName" label="Nom de la banque" />
            <TextField control={form.control} name="lessor.rib" label="RIB" />
            <TextField control={form.control} name="lessor.iban" label="IBAN" />
            <TextField control={form.control} name="lessor.bicSwift" label="BIC/SWIFT" />
          </Section>
        )}

        {isPrivate && isMoral && (
          <Section title="Représentant légal (entreprise)">
            <TextField control={form.control} name="lessor.representativeLastName" label="Nom du représentant légal" />
            <TextField control={form.control} name="lessor.representativeFirstName" label="Prénom du représentant légal" />
            <TextField control={form.control} name="lessor.representativeJob" label="Titre du représentant légal" />
            <TextField control={form.control} name="lessor.representativePhone" label="Numéro de téléphone du représentant légal" />
            <TextField control={form.control} name="lessor.representativeEmail" label="Adresse mail du représentant légal" />
          </Section>
        )}

        {isPrivate && (
          <Section title="Détails du contrat">
            {isPhysical ? (
              <FormField
                control={form.control}
                name="lessor.delayContract"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <DatePicker
                        label="Durée du contrat"
                        mode="range"
                        value={
                          field.value?.from && field.value.to
                            ? { from: new Date(field.value.from), to: new Date(field.value.to) }
                            : undefined
                        }
                        onChange={(e) => {
                          const range = e as { from: Date; to: Date };
                          field.onChange({ from: range.from, to: range.to });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="lessor.rentalStartDate"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <DatePicker
                          label="Date de début de location"
                          mode="single"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessor.rentalPeriod"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <Combobox
                          datas={rentalDurations}
                          value={field.value || ""}
                          setValue={e => field.onChange(String(e))}
                          placeholder="Durée de la location"
                          searchMessage="Rechercher une durée"
                          noResultsMessage="Aucune durée trouvée."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="lessor.paymentMode"
              render={({ field }) => {
                const selectedOptions = acceptPayment.filter((opt) => field.value?.includes(opt.value));
                return (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <MultipleSelect
                        label={
                          <span>
                            Mode de paiement <span className="text-red-500">*</span>
                          </span>
                        }
                        options={acceptPayment}
                        value={selectedOptions}
                        onChange={(options) => field.onChange(options.map((opt) => opt.value))}
                        placeholder="Sélectionner un ou plusieurs modes de paiement"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="lessor.paymentFrequency"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={paymentFrequency}
                      value={field.value || ""}
                      setValue={e => field.onChange(String(e))}
                      placeholder="Fréquence de paiement"
                      searchMessage="Rechercher une fréquence de paiement"
                      noResultsMessage="Aucune fréquence trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lessor.electricitySupply"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={electricitySupply}
                      value={field.value || ""}
                      setValue={e => field.onChange(String(e))}
                      placeholder="Fourniture du courant"
                      searchMessage="Rechercher une fourniture du courant"
                      noResultsMessage="Aucune fourniture du courant trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TextField
              control={form.control}
              name="lessor.specificCondition"
              label="Conditions spécifiques ou restriction"
              design="text-area"
              required={false}
            />
          </Section>
        )}
      </div>
    </ScrollArea>
  );
}
