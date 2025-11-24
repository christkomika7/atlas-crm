import { all } from "@/action/supplier.action";
import LessorTypeModal from "@/components/modal/lessor-type-modal";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { all as allCities } from "@/action/city.action";
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
  BillboardSchemaFormType,
  lessorError,
  LessorErrorType,
} from "@/lib/zod/billboard.schema";
import useBillboardStore from "@/stores/billboard.store";
import useCityStore from "@/stores/city.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { CityType } from "@/types/city.types";
import { SupplierType } from "@/types/supplier.types";
import { Decimal } from "decimal.js";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import CityModal from "../../../_component/city-modal";
import { MultipleSelect } from "@/components/ui/multi-select";
import { getBillboardLessorType } from "@/action/billboard.action";

type LessorInfoTabProps = {
  form: UseFormReturn<BillboardSchemaFormType>;
};

export default function LessorInfoTab({ form }: LessorInfoTabProps) {
  const companyId = useDataStore.use.currentCompany()
  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();
  const currentSpaceType = useBillboardStore.use.currentSpaceType?.();

  const lessorTypes = useBillboardStore.use.lessorTypes();
  const setLessorType = useBillboardStore.use.setLessorType();

  const setCities = useCityStore.use.setCity();
  const cities = useCityStore.use.cities();

  const [suppliers, setSupplier] = useState<SupplierType[]>([]);

  const {
    mutate: mutateCity,
    isPending: isPendingCity,
    data: dataCities,
  } = useQueryAction<{ companyId: string }, RequestResponse<CityType[]>>(
    allCities,
    () => { },
    "cities"
  );

  const { mutate: mutateGetSuppliers, isPending: isGettingSuppliers } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType[]>
  >(all, () => { }, "suppliers");

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

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4.5 mx-2 my-4 max-w-xl">
        <FormField
          control={form.control}
          name="lessor"
          render={({ fieldState }) => (
            <FormItem className="w-full">
              <FormControl></FormControl>
              {fieldState.error && (
                <ul className="bg-red/5 p-2 rounded-lg w-full text-red text-xs">
                  La section bailleur présente des erreurs,{" "}
                  {Object.entries(fieldState.error).length > 0 &&
                    "veuiller faire une vérification des champs "}
                  <br />
                  {Object.entries(fieldState.error).map(([field], index) => (
                    <li key={index}>
                      <span className="font-medium">
                        {lessorError[field as keyof LessorErrorType]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </FormItem>
          )}
        />
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">
            Informations sur le bailleur
          </h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="lessor.lessorSpaceType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={lessorSpaceType}
                      value={currentSpaceType ?? ""}
                      setValue={e => {
                        setCurrentSpaceType(e as "private" | "public");
                        field.onChange(e);
                      }}
                      placeholder="Type d'espace"
                      searchMessage="Rechercher un type d'espce"
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
                      value={field.value}
                      setValue={(e) => {
                        field.onChange(e);
                      }}
                      placeholder="Type de bailleur"
                      searchMessage="Rechercher un type"
                      noResultsMessage="Aucun type de bailleur trouvé."
                      addElement={<LessorTypeModal />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {currentSpaceType === "public" &&
              <FormField
                control={form.control}
                name="lessor.lessorCustomer"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        isLoading={isGettingSuppliers}
                        datas={suppliers.map(supplier => ({
                          id: supplier.id,
                          label: `${supplier.companyName} - ${supplier.firstname} ${supplier.lastname}`,
                          value: supplier.id
                        }))}
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Bailleur"
                        searchMessage="Rechercher un bailleur"
                        noResultsMessage="Aucun bailleur trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />}
            {currentSpaceType === "private" &&
              <>
                <FormField
                  control={form.control}
                  name="lessor.lessorName"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Nom du bailleur"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessor.lessorAddress"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Adresse complète du bailleur"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          setValue={(e) => {
                            field.onChange(e);
                          }}
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
                <FormField
                  control={form.control}
                  name="lessor.lessorPhone"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Numéro de téléphone du bailleur"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessor.lessorEmail"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Adresse mail du bailleur"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          value={field.value?.toString()}
                          handleChange={(e) => field.onChange(new Decimal(String(e)))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessor.rccm"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Registre du commerce (RCCM)"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.taxIdentificationNumber"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Numéro d'identification fiscale"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.niu"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          required={false}
                          design="float"
                          label="NIU"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.legalForms"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Statut juridique"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.bankName"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="Nom de la banque"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.rib"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="RIB"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.iban"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="IBAN"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lessor.bicSwift"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <TextInput
                          design="float"
                          label="BIC/SWIFT"
                          value={field.value}
                          handleChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            }
          </div>
        </div>
        {currentSpaceType === "private" && <>
          <div className="space-y-2.5">
            <h2 className="font-semibold text-sm">
              Représentant légal (entreprise)
            </h2>
            <div className="space-y-4.5">
              <FormField
                control={form.control}
                name="lessor.representativeLastName"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Nom du représentant légal"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.representativeFirstName"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Prénom du représentant légal"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.representativeJob"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Titre du représentant légal"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.representativePhone"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Numéro de téléphone du représentant légal"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.representativeEmail"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Adresse mail du représentant légal"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <h2 className="font-semibold text-sm">Détails du contrat</h2>
            <div className="space-y-4.5">
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
                        onChange={(e) => {
                          field.onChange(e)
                        }}
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
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Durée de la location"
                        searchMessage="Rechercher une durée"
                        noResultsMessage="Aucune durée trouvée."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.paymentMode"
                render={({ field }) => {
                  const selectedOptions = acceptPayment.filter((opt) =>
                    field.value?.includes(opt.value)
                  );

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
                          onChange={(options) => {
                            field.onChange(options.map((opt) => opt.value))
                          }
                          }
                          placeholder="Sélèctionner un ou plusieur mode de paiement"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }
                }
              />
              <FormField
                control={form.control}
                name="lessor.paymentFrequency"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        datas={paymentFrequency}
                        value={field.value as string}
                        setValue={field.onChange}
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
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Fourniture du courant"
                        searchMessage="Rechercher une fourniture du courant"
                        noResultsMessage="Aucune fourniture du courant trouvée."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lessor.specificCondition"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        required={false}
                        design="text-area"
                        label="Conditions spécifiques ou restriction"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </>}
      </div>
    </ScrollArea>
  );
}
