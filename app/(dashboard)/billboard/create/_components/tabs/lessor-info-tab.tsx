// =========================================
// LessorInfoTab.tsx — VERSION COMPLÈTE CORRIGÉE
// =========================================

import { all } from "@/action/supplier.action";
import { all as allCities } from "@/action/city.action";
import { getBillboardLessorType } from "@/action/billboard.action";
import LessorTypeModal from "@/components/modal/lessor-type-modal";
import CityModal from "../../../_component/city-modal";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import { MultipleSelect } from "@/components/ui/multi-select";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment, electricitySupply, lessorSpaceType, paymentFrequency, rentalDurations } from "@/lib/data";
import { BillboardSchemaFormType } from "@/lib/zod/billboard.schema";
import useBillboardStore from "@/stores/billboard.store";
import useCityStore from "@/stores/city.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { CityType } from "@/types/city.types";
import { SupplierType } from "@/types/supplier.types";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { MORAL_COMPANY, PHYSICAL_COMPANY } from "@/config/constant";
import { Section } from "@/components/ui/section";
import { TextField } from "@/components/ui/text-field";

type LessorInfoTabProps = {
  form: UseFormReturn<BillboardSchemaFormType>;
};

export default function LessorInfoTab({ form }: LessorInfoTabProps) {
  const companyId = useDataStore.use.currentCompany();
  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();
  const currentSpaceType = useBillboardStore.use.currentSpaceType?.();

  const lessorTypes = useBillboardStore.use.lessorTypes();
  const setLessorType = useBillboardStore.use.setLessorType();

  const cities = useCityStore.use.cities();
  const setCities = useCityStore.use.setCity();

  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [lessorTypeName, setLessorTypeName] = useState("");

  // Queries
  const { mutate: mutateCity, isPending: isPendingCity } = useQueryAction<{ companyId: string },
    RequestResponse<CityType[]>>(allCities, () => { }, "cities");

  const { mutate: mutateGetSuppliers, isPending: isGettingSuppliers } = useQueryAction<{ id: string },
    RequestResponse<SupplierType[]>>(all, () => { }, "suppliers");

  const { mutate: mutateGetElements, isPending: isGettingElements } = useQueryAction<
    { companyId: string; lessorSpace?: string },
    RequestResponse<BaseType[]>
  >(getBillboardLessorType, () => { }, "lessor-type");


  // Load suppliers + cities
  useEffect(() => {
    if (!companyId) return;

    mutateGetSuppliers({ id: companyId }, {
      onSuccess(data) {
        if (data.data) setSuppliers(data.data);
      },
    });

    mutateCity({ companyId }, {
      onSuccess(data) {
        if (data.data) setCities(data.data);
      },
    });
  }, [companyId]);

  // Load lessor types based on spaceType
  useEffect(() => {
    if (!currentSpaceType || !companyId) return;

    mutateGetElements(
      { companyId, lessorSpace: currentSpaceType },
      {
        onSuccess(data) {
          if (data.data) setLessorType(data.data);
        },
      }
    );
  }, [currentSpaceType, companyId]);

  const handleLessorTypeChange = (id: string) => {
    const name = lessorTypes.find((l) => l.id === id)?.name || "";
    setLessorTypeName(name);
    form.setValue("lessor.lessorTypeName", name);
  };

  // DISPLAY LOGIC
  const isPrivate = currentSpaceType === "private";
  const isPublic = currentSpaceType === "public";

  const isPhysical = lessorTypeName === PHYSICAL_COMPANY;
  const isMoral = lessorTypeName === MORAL_COMPANY;

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-6 mx-2 my-4 max-w-xl">

        {/* ==========================
            SECTION: INFO BAILLEUR
        ========================== */}
        <Section title="Informations sur le bailleur">

          {/* Type d'espace */}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type bailleur */}
          <FormField
            control={form.control}
            name="lessor.lessorType"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <Combobox
                    isLoading={isGettingElements}
                    datas={lessorTypes.map((lt) => ({
                      id: lt.id,
                      label: lt.name,
                      value: lt.id,
                    }))}
                    value={field.value || ""}
                    setValue={(e) => {
                      handleLessorTypeChange(String(e));
                      field.onChange(String(e));
                    }}
                    placeholder="Type de bailleur"
                    addElement={<LessorTypeModal lessorSpaceType={currentSpaceType} />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ==========================
              PRIVATE CASE
          ========================== */}
          {isPrivate && (
            <>
              <TextField control={form.control} name="lessor.locationPrice" label="Prix du panneau loué" type="number" />
              <TextField control={form.control} name="lessor.nonLocationPrice" label="Prix du panneau non loué" type="number" />
            </>
          )}

          {/* ==========================
              PUBLIC CASE
          ========================== */}
          {isPublic && (
            <FormField
              control={form.control}
              name="lessor.lessorCustomer"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingSuppliers}
                      datas={suppliers.map((s) => ({
                        id: s.id,
                        label: `${s.companyName} - ${s.firstname} ${s.lastname}`,
                        value: s.id,
                      }))}
                      value={field.value || ""}
                      setValue={(e) => field.onChange(String(e))}
                      placeholder="Bailleur"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* ==========================
              PRIVATE DETAILS
          ========================== */}
          {isPrivate && (
            <>
              <TextField control={form.control} name="lessor.lessorName" label="Nom du bailleur" />
              <TextField control={form.control} name="lessor.lessorAddress" label="Adresse complète du bailleur" />

              {/* City */}
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
                        value={field.value || ""}
                        setValue={(e) => field.onChange(String(e))}
                        placeholder="Ville"
                        addElement={<CityModal />}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TextField control={form.control} name="lessor.lessorPhone" label="Téléphone" />
              <TextField control={form.control} name="lessor.lessorEmail" label="Email" />

              {/* PHYSICAL ONLY */}
              {isPhysical && (
                <TextField control={form.control} name="lessor.identityCard" label="Numéro carte d'identité" required={false} />
              )}

              {/* MORAL ONLY */}
              {isMoral && (
                <>
                  <TextField control={form.control} name="lessor.capital" label="Capital" type="number" />
                  <TextField control={form.control} name="lessor.rccm" label="RCCM" />
                  <TextField control={form.control} name="lessor.taxIdentificationNumber" label="NIF" />
                  <TextField control={form.control} name="lessor.niu" label="NIU" required={false} />
                  <TextField control={form.control} name="lessor.legalForms" label="Forme juridique" />
                </>
              )}
            </>
          )}
        </Section>

        {/* ==========================
            SECTION: BANQUE
        ========================== */}
        {isPrivate && (
          <Section title="Information sur la banque">
            <TextField control={form.control} name="lessor.bankName" label="Nom de la banque" />
            <TextField control={form.control} name="lessor.rib" label="RIB" />
            <TextField control={form.control} name="lessor.iban" label="IBAN" />
            <TextField control={form.control} name="lessor.bicSwift" label="BIC/SWIFT" />
          </Section>
        )}

        {/* ==========================
            SECTION: REPRESENTANT LEGAL
        ========================== */}
        {isPrivate && isMoral && (
          <Section title="Représentant légal">
            <TextField control={form.control} name="lessor.representativeLastName" label="Nom" />
            <TextField control={form.control} name="lessor.representativeFirstName" label="Prénom" />
            <TextField control={form.control} name="lessor.representativeJob" label="Fonction" />
            <TextField control={form.control} name="lessor.representativePhone" label="Téléphone" />
            <TextField control={form.control} name="lessor.representativeEmail" label="Email" />
          </Section>
        )}

        {/* ==========================
            SECTION: CONTRAT
        ========================== */}
        {isPrivate && (
          <Section title="Détails du contrat">

            {isPhysical ? (
              <>
                <FormField
                  control={form.control}
                  name="lessor.delayContractStart"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <DatePicker
                          label="Date début du contrat"
                          mode="single"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(e) => {
                            if (e) {
                              const date = e as Date
                              field.onChange(date.toISOString())
                              return
                            }
                            field.onChange(undefined)
                          }
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lessor.delayContractEnd"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <DatePicker
                          label="Date fin du contrat"
                          mode="single"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(e) => {
                            if (e) {
                              const date = e as Date
                              field.onChange(date.toISOString())
                              return
                            }
                            field.onChange(undefined)
                          }
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                {/* START DATE */}
                <FormField
                  control={form.control}
                  name="lessor.rentalStartDate"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <DatePicker
                          label="Date début location"
                          mode="single"
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(e) => {
                            if (e) {
                              const date = e as Date
                              field.onChange(date.toISOString())
                              return
                            }
                            field.onChange(undefined)
                          }
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DURATION */}
                <FormField
                  control={form.control}
                  name="lessor.rentalPeriod"
                  render={({ field }) => (
                    <FormItem className="-space-y-2">
                      <FormControl>
                        <Combobox
                          datas={rentalDurations}
                          value={field.value || ""}
                          setValue={(e) => field.onChange(String(e))}
                          placeholder="Durée du contrat"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* PAYMENT MODE */}
            <FormField
              control={form.control}
              name="lessor.paymentMode"
              render={({ field }) => {
                const selected = acceptPayment.filter((opt) => field.value?.includes(opt.value));
                return (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <MultipleSelect
                        label="Mode de paiement *"
                        options={acceptPayment}
                        value={selected}
                        onChange={(opt) => field.onChange(opt.map((o) => o.value))}
                        placeholder="Sélectionner un ou plusieurs modes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* PAYMENT FREQUENCY */}
            <FormField
              control={form.control}
              name="lessor.paymentFrequency"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={paymentFrequency}
                      value={field.value || ""}
                      setValue={(e) => field.onChange(String(e))}
                      placeholder="Fréquence de paiement"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ELECTRICITY */}
            <FormField
              control={form.control}
              name="lessor.electricitySupply"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={electricitySupply}
                      value={field.value || ""}
                      setValue={(e) => field.onChange(String(e))}
                      placeholder="Fourniture du courant"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SPECIFIC CONDITION */}
            <TextField
              control={form.control}
              name="lessor.specificCondition"
              label="Conditions particulières"
              design="text-area"
              required={false}
            />
          </Section>
        )}

      </div>
    </ScrollArea>
  );
}
