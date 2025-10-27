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
import {
  CompanySchemaType,
  editCompanySchema,
  EditCompanySchemaType,
} from "@/lib/zod/company.schema";

import TextInput from "@/components/ui/text-input";
import EmployeePanel from "./employee-panel";
import TaxPanel from "./tax-panel";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { update } from "@/action/company.action";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserType } from "@/types/user.types";
import { useEmployeeStore } from "@/stores/employee.store";
import useCompanyStore from "@/stores/company.store";
import { getFileByType } from "@/lib/file-storage";
import EditCompanyFormErrors from "@/components/errors/edit-company-form-errors";
import useTaxStore from "@/stores/tax.store";

type UpdateCompanyFormProps = {
  id: string;
};

export default function UpdateCompanyForm({ id }: UpdateCompanyFormProps) {
  const router = useRouter();

  const taxs = useTaxStore.use.taxs();

  const updateCompany = useCompanyStore.use.updateCompany();
  const getCompany = useCompanyStore.use.getCompany();

  const employees = useEmployeeStore.use.employees()
  const getEmployees = useEmployeeStore.use.getEmployees();
  const updateEmployee = useEmployeeStore.use.updateEmployee();

  const form = useForm<EditCompanySchemaType>({
    resolver: zodResolver(editCompanySchema)
  });

  useEffect(() => {
    const company = getCompany();
    const employees = getEmployees();

    if (employees?.length > 0) {
      employees.map(async (employee, index) => {
        const profile = await getFileByType(employee?.email, "profile");
        const passport = await getFileByType(employee?.email, "passport");
        const document = await getFileByType(employee?.email, "doc");
        updateEmployee(index, {
          image: profile,
          passport,
          document,
        });
      });
    }

    if (company) {
      form.reset({
        companyName: company.companyName,
        country: company.country,
        registeredAddress: company.registeredAddress,
        phoneNumber: company.phoneNumber,
        city: company.city,
        codePostal: company.codePostal,
        email: company.email,
        website: company.website,
        businessRegistrationNumber: company.businessRegistrationNumber,
        taxIdentificationNumber: company.taxIdentificationNumber,
        capitalAmount: company.capitalAmount,
        vatRate: company.vatRate,
        currency: company.currency,
        fiscal: company.fiscal && {
          from: new Date(company.fiscal.from),
          to: new Date(company.fiscal.to),
        },
        bankAccountDetails: company.bankAccountDetails,
        businessActivityType: company.businessActivityType,
      });
    }
  }, []);


  const { mutate, isPending } = useQueryAction<
    EditCompanySchemaType,
    RequestResponse<CompanyType<UserType>[]>
  >(
    update,
    () => {
      form.reset();
      router.push("/settings");
    },
    "companies"
  );

  useEffect(() => {
    form.setValue('employees', employees);
  }, [employees])

  useEffect(() => {
    form.setValue("vatRate", taxs);
  }, [taxs])


  function handleData(field: Partial<keyof CompanySchemaType>, value: any) {
    updateCompany({ [field]: value });
  }

  function submit(formData: EditCompanySchemaType) {
    const { success, data } = editCompanySchema.safeParse(formData);
    if (success) {
      mutate({ ...data, id });
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
                    handleData("companyName", value)
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
                    handleData("country", value)
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
                    handleData("city", value)
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
                    handleData("codePostal", value)
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
                    handleData("registeredAddress", value)
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
                    handleData("phoneNumber", value)
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
                    handleData("email", value)
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
                    handleData("website", value)
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
                        handleData("businessRegistrationNumber", value)
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
                        handleData("taxIdentificationNumber", value)
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
                        handleData("capitalAmount", String(value))
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
                        handleData("currency", value)
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
          <h2 className="font-semibold text-sm">Gestion des employés</h2>
          <FormField
            control={form.control}
            name="employees"
            render={() => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <EmployeePanel />
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
                        handleData("fiscal", value)
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
                        handleData("bankAccountDetails", value)
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
                        handleData("businessActivityType", value)
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
                      handleChange={field.onChange}
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
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <EditCompanyFormErrors form={form} />

        <div className="flex justify-center pt-2">
          <Button type="submit" variant="primary" className="max-w-sm">
            {isPending ? <Spinner /> : "Valider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
