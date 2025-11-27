"use client";

import { RequestResponse } from "@/types/api.types";
import { CompanyType } from "@/types/company.types";
import { unique } from "@/action/company.action";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

import Header from "@/components/header/header";
import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import UpdateCompanyForm from "../../_component/update-company-form";
import useTaxStore from "@/stores/tax.store";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function UpdateCompany() {
  const param = useParams();
  const setTaxs = useTaxStore.use.setTaxs();
  const [company, setCompany] = useState<CompanyType>();

  const { access: modifyAccess, loading } = useAccess("SETTING", "MODIFY")

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<CompanyType>
  >(unique, () => { }, "company");

  useEffect(() => {
    if (param.id && modifyAccess) {
      mutate(
        { id: param.id as string },
        {
          async onSuccess(data) {
            if (data.data) {
              setCompany(data.data)
              setTaxs(data.data.vatRates);
            }
          },
        }
      );
    }
  }, [param.id, modifyAccess]);

  if (loading) return <Spinner />

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-9.5">
        <Header back="/settings" title="Modification de l'entreprise" />
      </div>
      <AccessContainer hasAccess={modifyAccess} resource="SETTING" >
        <div className="flex-1 min-h-0">
          <ScrollArea className="w-full h-full">
            <div className="pr-2">
              {isPending && <Spinner />}
              {!isPending && company && (
                <UpdateCompanyForm id={param.id as string} company={company} />
              )}
            </div>
          </ScrollArea>
        </div>
      </AccessContainer>
    </div>
  );
}
