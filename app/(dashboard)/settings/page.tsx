"use client";

import { AddCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Header from "@/components/header/header";
import { useRouter } from "next/navigation";
import { useEmployeeStore } from "@/stores/employee.store";
import useCompanyStore from "@/stores/company.store";
import { Tabs } from "@/components/ui/tabs";
import { tabs } from "./_components/tabs/tab";
import { useAccess } from "@/hook/useAccess";

export default function SettingsPage() {
  const router = useRouter();
  const clearCompany = useCompanyStore.use.clearCompany();
  const resetEmployees = useEmployeeStore.use.resetEmployees();

  const { access: createAccess } = useAccess("SETTING", "CREATE");

  function goTo() {
    clearCompany();
    resetEmployees();
    router.push("/settings/company/create");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header back="/" title="Paramètres">
        {createAccess &&
          <div className="flex items-center gap-x-2">
            <Button
              onClick={goTo}
              variant="primary"
              className="flex items-center w-fit !h-11.5"
            >
              <span className="flex w-5 h-5">
                <AddCircleIcon />
              </span>
              <span>Ajouter une entreprise</span>
            </Button>
          </div>
        }
      </Header>

      <div className="flex-1 px-6 py-4 overflow-auto">
        <Tabs tabs={tabs} tabId="setting-tab" />
      </div>
    </div>
  );
}
