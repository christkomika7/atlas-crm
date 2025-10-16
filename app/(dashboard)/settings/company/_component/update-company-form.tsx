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
import { Decimal } from "decimal.js";

type UpdateCompanyFormProps = {
  id: string;
};

export default function UpdateCompanyForm({ id }: UpdateCompanyFormProps) {
  const router = useRouter();
  const updateCompany = useCompanyStore.use.updateCompany();
  const getCompany = useCompanyStore.use.getCompany();
  const getEmployees = useEmployeeStore.use.getEmployees();
  const updateEmployee = useEmployeeStore.use.updateEmployee();

  const form = useForm<EditCompanySchemaType>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      companyName: "",
      registeredAddress: "",
      phoneNumber: "",
      email: "",
      city: "",
      codePostal: "",
      website: "",
      businessRegistrationNumber: "",
      taxIdentificationNumber: "",
      capitalAmount: "",
      vatRate: [],
      currency: "",
      employees: [],
      fiscal: { from: undefined, to: undefined },
      bankAccountDetails: "",
      businessActivityType: "",
    },
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
      const defaultValues: Partial<EditCompanySchemaType> = {
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
      };
      form.reset(defaultValues);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((formData) => {
      updateCompany({
        companyName: formData.companyName ?? "",
        registeredAddress: formData.registeredAddress ?? "",
        phoneNumber: formData.phoneNumber ?? "",
        email: formData.email ?? "",
        city: formData.city,
        codePostal: formData.codePostal,
        website: formData.website ?? "",
        businessRegistrationNumber: formData.businessRegistrationNumber ?? "",
        taxIdentificationNumber: formData.taxIdentificationNumber ?? "",
        capitalAmount: formData.capitalAmount ? formData.capitalAmount : "",
        currency: formData.currency ?? "",
        fiscal:
          formData && formData.fiscal?.from && formData.fiscal.to
            ? {
              from: new Date(formData.fiscal.from),
              to: new Date(formData.fiscal.to),
            }
            : undefined,
        bankAccountDetails: formData.bankAccountDetails ?? "",
        businessActivityType: formData.businessActivityType ?? "",
        country: formData.country ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
    form.watch((data) => {
      console.log({ errors: form.formState.errors });
      console.log({ data })
    })
  }, [form.watch])

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
                  handleChange={field.onChange}
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
                  setValue={field.onChange}
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
                  handleChange={field.onChange}
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
                  handleChange={field.onChange}
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
                  handleChange={field.onChange}
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
                  handleChange={field.onChange}
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
                  handleChange={field.onChange}
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
                  handleChange={field.onChange}
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
                      handleChange={field.onChange}
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
                      handleChange={field.onChange}
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
                      handleChange={(e) => field.onChange(String(e))}
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
                      setValue={field.onChange}
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
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TaxPanel taxs={field.value} setTaxs={field.onChange} />
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
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <EmployeePanel handleChange={field.onChange} />
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
