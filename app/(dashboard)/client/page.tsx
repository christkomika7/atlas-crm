"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import ClientsTable, { ClientsTableRef } from "./_components/clients-table";
import ClientsCreateModal from "./_components/clients-create-modal";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { ClientType } from "@/types/client.types";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/client.action";
import Spinner from "@/components/ui/spinner";
import AppointmentsCreateModal from "./_components/appointment-create-modal";

export default function ClientPage() {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  const clientsTableRef = useRef<ClientsTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<ClientType[]>
  >(removeMany, () => { }, "clients");

  const handleClientAdded = () => {
    clientsTableRef.current?.refreshClients();
  };

  function removeClients() {
    if (selectedClientIds.length > 0) {
      mutate(
        { ids: selectedClientIds },
        {
          onSuccess() {
            setSelectedClientIds([]);
            handleClientAdded();
          },
        }
      );
    }
  }

  return (
    <div className="flex flex-col justify-between space-y-4 h-full">
      <div className="flex flex-col space-y-9">
        <Header title="Listes des clients">
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
                  {selectedClientIds.length > 0 &&
                    `(${selectedClientIds.length})`}{" "}
                  Suppression
                </>
              )}
            </Button>
            <ClientsCreateModal onClientAdded={handleClientAdded} />
          </div>
        </Header>
        <div className="flex">
          <ClientsTable
            ref={clientsTableRef}
            selectedClientIds={selectedClientIds}
            setSelectedClientIds={setSelectedClientIds}
          />
        </div>
      </div>
      <AppointmentsCreateModal />
    </div>
  );
}
