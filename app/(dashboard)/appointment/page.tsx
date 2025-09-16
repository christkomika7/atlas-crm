"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import AppointmentsCreateModal from "./_components/appointment-create-modal";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { AppointmentType } from "@/types/appointment.type";
import { removeMany } from "@/action/appointment.action";
import { AppointmentTableRef } from "./_components/appointment-table";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import UpcomingTab from "./_components/tabs/upcoming-tab";
import PastTab from "./_components/tabs/past-tab";

export default function AppointmentPage() {
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  const appointmentTableRef = useRef<AppointmentTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<AppointmentType[]>
  >(removeMany, () => {}, "appointments");

  const handleAppointmentAdded = () => {
    appointmentTableRef.current?.refreshAppointment();
  };

  function removeClients() {
    if (selectedClientIds.length > 0) {
      mutate(
        { ids: selectedClientIds },
        {
          onSuccess() {
            setSelectedClientIds([]);
            handleAppointmentAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Rendez-vous">
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
          <AppointmentsCreateModal
            onAppointmentAdded={handleAppointmentAdded}
          />
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "À venir",
            content: (
              <UpcomingTab
                appointmentTableRef={appointmentTableRef}
                selectedAppointmentIds={selectedClientIds}
                setSelectedAppointmentIds={setSelectedClientIds}
              />
            ),
          },
          {
            id: 2,
            title: "Passé",
            content: (
              <PastTab
                appointmentTableRef={appointmentTableRef}
                selectedAppointmentIds={selectedClientIds}
                setSelectedAppointmentIds={setSelectedClientIds}
              />
            ),
          },
        ]}
        tabId="appointment-tab"
      />
    </div>
  );
}
