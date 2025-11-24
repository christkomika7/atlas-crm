"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { currencies, formatedCountries } from "@/lib/helper";
import { companySchema, CompanySchemaType } from "@/lib/zod/company.schema";

import TextInput from "@/components/ui/text-input";
import TaxPanel from "./tax-panel";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { create } from "@/action/company.action";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useTaxStore from "@/stores/tax.store";
import { useDataStore } from "@/stores/data.store";

export default function CreateCompanyForm() {
  const router = useRouter();

  const clearTaxs = useTaxStore.use.clearTaxs();
  const taxs = useTaxStore.use.taxs();

  const setCurrentCompany = useDataStore.use.setCurrentCompany();
  const setCurrency = useDataStore.use.setCurrency();
  const currentCompany = useDataStore.use.currentCompany();

  const form = useForm<CompanySchemaType>({
    resolver: zodResolver(companySchema)
  });

  const { mutate, isPending } = useQueryAction<
    CompanySchemaType,
    RequestResponse<CompanyType>
  >(create, () => { }, ["companies", "countries"]);


  useEffect(() => {
    form.setValue("vatRate", taxs);
  }, [taxs])


  async function submit(formData: CompanySchemaType) {
    const { success, data } = companySchema.safeParse(formData);
    if (success) {
      mutate(
        { ...data },
        {
          onSuccess(data) {
            if (data.data && !currentCompany) {
              setCurrentCompany(data.data.id);
              setCurrency(data.data.currency);
            }
            form.reset();
            clearTaxs();
            router.push("/settings");
          },
        }
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-4.5 m-2 max-w-xl"
      >
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Nom de l'entreprise"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <Combobox
                  datas={formatedCountries}
                  value={field.value}
                  setValue={(value) => {
                    field.onChange(value)
                  }}
                  placeholder="Pays de résidence"
                  searchMessage="Rechercher un pays"
                  noResultsMessage="Aucun pays trouvé."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Ville"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codePostal"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Boite postale"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="registeredAddress"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Adresse enregistrée"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Numéro de téléphone"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Adresse mail"
                  value={field.value}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  required={false}
                  design="float"
                  label="Site internet"
                  value={field.value ?? ""}
                  handleChange={(value) => {
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">
            Informations financières et juridiques
          </h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="businessRegistrationNumber"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro d’immatriculation (RCCM)"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxIdentificationNumber"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro d'identification fiscale (NIF)"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="niu"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="NIU"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="legalForms"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Statut juridique"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capitalAmount"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Montant du capital"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(String(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={currencies}
                      value={field.value}
                      setValue={(value) => {
                        field.onChange(value)
                      }}
                      placeholder="Devise"
                      searchMessage="Rechercher une devise"
                      noResultsMessage="Aucune devise trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">Taxes</h2>
          <FormField
            control={form.control}
            name="vatRate"
            render={() => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TaxPanel />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">
            Informations supplémentaires
          </h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="fiscal"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      label="Durées de l'exercice fiscal"
                      mode="range"
                      value={
                        field.value?.from && field.value.to
                          ? {
                            from: new Date(field.value.from),
                            to: new Date(field.value.to),
                          }
                          : undefined
                      }
                      onChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccountDetails"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Détails du compte bancaire"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessActivityType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Secteur d'activité"
                      value={field.value}
                      handleChange={(value) => {
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button type="submit" variant="primary" className="max-w-sm">
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
