"use client";

import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { unique } from "@/action/company.action";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

import Header from "@/components/header/header";
import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import UpdateCompanyForm from "../../_component/update-company-form";
import useCompanyStore from "@/stores/company.store";
import { UserType } from "@/types/user.types";
import { useEmployeeStore } from "@/stores/employee.store";
import { setFile } from "@/lib/file-storage";
import { formatPermissions } from "@/lib/permission";
import useTaxStore from "@/stores/tax.store";

export default function UpdateCompany() {
  const param = useParams();

  const setTaxs = useTaxStore.use.setTaxs();

  const setCompany = useCompanyStore.use.setCompany();
  const getCompany = useCompanyStore.use.getCompany();

  const addEmployees = useEmployeeStore.use.addEmployees();

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<CompanyType<UserType<File>>>
  >(unique, () => { }, "company");

  useEffect(() => {
    if (param.id) {
      mutate(
        { id: param.id as string },
        {
          async onSuccess(data) {
            const company = data.data;
            if (!company) return;

            const store = getCompany();
            if (store && store.key) return;

            setCompany({
              key: crypto.randomUUID(),
              companyName: company.companyName ?? "",
              registeredAddress: company.registeredAddress ?? "",
              phoneNumber: company.phoneNumber ?? "",
              city: company.city,
              codePostal: company.codePostal,
              email: company.email ?? "",
              website: company.website ?? "",
              businessRegistrationNumber:
                company.businessRegistrationNumber ?? "",
              taxIdentificationNumber: company.taxIdentificationNumber ?? "",
              capitalAmount: company.capitalAmount ?? "",
              currency: company.currency ?? "",
              fiscal: {
                from: company.fiscalYearStart,
                to: company.fiscalYearEnd,
              },
              vatRate: company.vatRates,
              bankAccountDetails: company.bankAccountDetails ?? "",
              businessActivityType: company.businessActivityType ?? "",
              country: company.country ?? "",
            });

            setTaxs(company.vatRates);

            const employees = await Promise.all(
              company.employees.map(async (employee) => {
                let permissions = formatPermissions(employee.permissions);
                if (employee.image) {
                  await setFile(employee.email, {
                    type: "profile",
                    file: employee.image,
                  });
                }
                if (employee.profile.passport) {
                  await setFile(employee.email, {
                    type: "passport",
                    file: employee.profile.passport,
                  });
                }
                if (employee.profile.internalRegulations) {
                  await setFile(employee.email, {
                    type: "doc",
                    file: employee.profile.internalRegulations,
                  });
                }

                return {
                  id: employee.id,
                  firstname: employee.profile.firstname,
                  lastname: employee.profile.lastname,
                  email: employee.email,
                  phone: employee.profile.phone ?? "",
                  job: employee.profile.job,
                  salary: employee.profile.salary,
                  image: employee.image,
                  password: "",
                  passport: employee.profile.passport,
                  document: employee.profile.internalRegulations,
                  ...permissions,
                };
              })
            );
            addEmployees(employees);
          },
        }
      );
    }
  }, [param.id]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-9.5">
        <Header back="/settings" title="Modification de l'entreprise" />
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="w-full h-full">
          <div className="pr-2">
            {isPending && <Spinner />}
            {!isPending && data?.data && (
              <UpdateCompanyForm id={param.id as string} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
