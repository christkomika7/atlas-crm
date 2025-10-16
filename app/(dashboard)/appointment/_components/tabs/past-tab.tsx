import React, { Dispatch, RefObject, SetStateAction } from "react";
import AppointmentTable, { AppointmentTableRef } from "../appointment-table";

type PastTabProps = {
  appointmentTableRef: RefObject<AppointmentTableRef | null>;
  selectedAppointmentIds: string[];
  setSelectedAppointmentIds: Dispatch<SetStateAction<string[]>>;
};

export default function PastTab({
  appointmentTableRef,
  selectedAppointmentIds,
  setSelectedAppointmentIds,
}: PastTabProps) {
  return (
    <div className="pt-4">
      <AppointmentTable
        filter="past"
        ref={appointmentTableRef}
        selectedAppointmentIds={selectedAppointmentIds}
        setSelectedAppointmentIds={setSelectedAppointmentIds}
      />
    </div>
  );
}
