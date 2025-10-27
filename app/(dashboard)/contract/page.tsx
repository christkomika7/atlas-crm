"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import AppointmentsCreateModal from "./_components/contract-create-modal";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { AppointmentType } from "@/types/appointment.type";
import { removeMany } from "@/action/appointment.action";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { ContractTableRef } from "./_components/contract-table";
import ClientTab from "./_components/tabs/client-tab";
import LessorTab from "./_components/tabs/lessor-tab";


export default function ContractPage() {
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);

  const contractTableRef = useRef<ContractTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<AppointmentType[]>
  >(removeMany, () => { }, "contract");

  const handleContractAdded = () => {
    contractTableRef.current?.refreshContract();
  };

  function removeClients() {
    if (selectedContractIds.length > 0) {
      mutate(
        { ids: selectedContractIds },
        {
          onSuccess() {
            setSelectedContractIds([]);
            handleContractAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Contrat">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removeClients}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedContractIds.length > 0 &&
                  `(${selectedContractIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <AppointmentsCreateModal
            onAppointmentAdded={handleContractAdded}
          />
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "Contrat client",
            content: (
              <ClientTab
                contractTableRef={contractTableRef}
                selectedContractIds={selectedContractIds}
                setSelectedContractIds={setSelectedContractIds}
              />
            ),
          },
          {
            id: 2,
            title: "Contrat bailleur",
            content: (
              <LessorTab
                contractTableRef={contractTableRef}
                selectedContractIds={selectedContractIds}
                setSelectedContractIds={setSelectedContractIds}
              />
            ),
          },
        ]}
        tabId="contract-tab"
      />
    </div>
  );
}
