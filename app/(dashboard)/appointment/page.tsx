"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import AppointmentsCreateModal from "./_components/appointment-create-modal";
import { useEffect, useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { AppointmentType } from "@/types/appointment.type";
import { removeMany } from "@/action/appointment.action";
import { AppointmentTableRef } from "./_components/appointment-table";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import UpcomingTab from "./_components/tabs/upcoming-tab";
import PastTab from "./_components/tabs/past-tab";
import { useAccess } from "@/hook/useAccess";
import useTabStore from "@/stores/tab.store";

export default function AppointmentPage() {
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
  const tab = useTabStore.use.tabs()["appointment-tab"];


  const appointmentTableRef = useRef<AppointmentTableRef>(null);

  const { access: createAccess } = useAccess("APPOINTMENT", "CREATE");
  const { access: modifyAccess } = useAccess("APPOINTMENT", "MODIFY");

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<AppointmentType[]>
  >(removeMany, () => { }, "appointments");

  useEffect(() => {
    setSelectedAppointmentIds([]);
  }, [tab])

  const refreshAppointment = () => {
    appointmentTableRef.current?.refreshAppointment();
  };

  function removeClients() {
    if (selectedAppointmentIds.length > 0) {
      mutate(
        { ids: selectedAppointmentIds },
        {
          onSuccess() {
            setSelectedAppointmentIds([]);
            refreshAppointment();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Rendez-vous">
        <div className="flex gap-x-2">
          {modifyAccess &&
            <Button
              variant="primary"
              className="bg-red w-fit font-medium"
              onClick={removeClients}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <>
                  {selectedAppointmentIds.length > 0 &&
                    `(${selectedAppointmentIds.length})`}{" "}
                  Suppression
                </>
              )}
            </Button>
          }
          {createAccess &&
            <AppointmentsCreateModal
              onAppointmentAdded={refreshAppointment}
            />
          }
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
                selectedAppointmentIds={selectedAppointmentIds}
                setSelectedAppointmentIds={setSelectedAppointmentIds}
              />
            ),
          },
          {
            id: 2,
            title: "Passé",
            content: (
              <PastTab
                appointmentTableRef={appointmentTableRef}
                selectedAppointmentIds={selectedAppointmentIds}
                setSelectedAppointmentIds={setSelectedAppointmentIds}
              />
            ),
          },
        ]}
        tabId="appointment-tab"
      />
    </div>
  );
}
