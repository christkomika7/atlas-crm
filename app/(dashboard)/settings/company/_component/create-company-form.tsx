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
import EmployeePanel from "./employee-panel";
import TaxPanel from "./tax-panel";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { create } from "@/action/company.action";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import useCompanyStore from "@/stores/company.store";
import { useEffect } from "react";
import { useEmployeeStore } from "@/stores/employee.store";
import { UserType } from "@/types/user.types";
import { clearAllFiles, clearFiles, getFileByType } from "@/lib/file-storage";
import useTaxStore from "@/stores/tax.store";
import { useDataStore } from "@/stores/data.store";

export default function CreateCompanyForm() {
  const router = useRouter();
  const resetEmployees = useEmployeeStore.use.resetEmployees();
  const clearTaxs = useTaxStore.use.clearTaxs();

  const getCompany = useCompanyStore.use.getCompany();
  const updateCompany = useCompanyStore.use.updateCompany();
  const clearCompany = useCompanyStore.use.clearCompany();
  const updateEmployee = useEmployeeStore.use.updateEmployee();
  const getEmployees = useEmployeeStore.use.getEmployees();
  const setTaxs = useTaxStore.use.setTaxs();
  const getTaxs = useTaxStore.use.getTaxs();
  const setCurrentCompany = useDataStore.use.setCurrentCompany();
  const setCurrency = useDataStore.use.setCurrency();
  const currentCompany = useDataStore.use.currentCompany();

  const form = useForm<CompanySchemaType>({
    resolver: zodResolver(companySchema),
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
      country: "",
    },
  });

  const { mutate, isPending } = useQueryAction<
    CompanySchemaType,
    RequestResponse<CompanyType<UserType>>
  >(create, () => { }, ["companies", "countries"]);

  useEffect(() => {
    router.refresh();
    const company = getCompany();
    const employees = getEmployees();
    const taxs = getTaxs();

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

    const defaultValues: Partial<CompanySchemaType> = {
      companyName: company?.companyName ?? "",
      registeredAddress: company?.registeredAddress ?? "",
      phoneNumber: company?.phoneNumber ?? "",
      email: company?.email ?? "",
      website: company?.website ?? "",
      city: company?.city,
      codePostal: company?.codePostal ?? "",
      businessRegistrationNumber: company?.businessRegistrationNumber ?? "",
      taxIdentificationNumber: company?.taxIdentificationNumber ?? "",
      capitalAmount: company ? company.capitalAmount : "",
      vatRate: taxs.length > 0 ? taxs : [],
      currency: company?.currency ?? "",
      fiscal:
        company?.fiscal && company.fiscal.from && company.fiscal.to
          ? {
            from: new Date(company.fiscal.from),
            to: new Date(company.fiscal.to),
          }
          : undefined,
      bankAccountDetails: company?.bankAccountDetails ?? "",
      businessActivityType: company?.businessActivityType ?? "",
      country: company?.country ?? "",
    };

    form.reset(defaultValues);
  }, []);

  useEffect(() => {
    const subscription = form.watch((formData) => {
      if (Array.isArray(formData.vatRate) && formData.vatRate.length > 0) {
        const validTaxs = formData.vatRate
          .filter(
            (item): item is NonNullable<typeof item> =>
              !!item && !!item.taxName && Array.isArray(item.taxValue)
          )
          .map((item) => ({
            taxName: item.taxName!,
            taxValue: item.taxValue!,
            cumul: Array.isArray(item.cumul)
              ? item.cumul.filter(
                (c): c is { id: number; name: string; check: boolean } =>
                  !!c &&
                  typeof c.id === "number" &&
                  !!c.name &&
                  typeof c.check === "boolean"
              )
              : undefined,
          }));

        setTaxs(validTaxs);
      }

      updateCompany({
        companyName: formData.companyName ?? "",
        registeredAddress: formData.registeredAddress ?? "",
        phoneNumber: formData.phoneNumber ?? "",
        email: formData.email ?? "",
        website: formData.website ?? "",
        city: formData.city,
        codePostal: formData.codePostal,
        businessRegistrationNumber: formData.businessRegistrationNumber ?? "",
        taxIdentificationNumber: formData.taxIdentificationNumber ?? "",
        capitalAmount: formData.capitalAmount ? formData.capitalAmount : "",
        currency: formData.currency ?? "",
        fiscal:
          formData.fiscal?.from && formData.fiscal?.to
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

  async function submit(formData: CompanySchemaType) {
    const { success, data } = companySchema.safeParse(formData);
    const employeesKey = data?.employees.map((employee) => employee.email);
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
            resetEmployees();
            clearCompany();
            clearTaxs();
            clearAllFiles();
            if (employeesKey && employeesKey.length > 0) {
              employeesKey?.forEach((key) => clearFiles(key));
            }
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

        <div className="flex justify-center pt-2">
          <Button type="submit" variant="primary" className="max-w-sm">
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
