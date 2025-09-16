import { Dispatch, RefObject, SetStateAction } from "react";
import AppointmentTable, { AppointmentTableRef } from "../appointment-table";

type UpcomingTabProps = {
  appointmentTableRef: RefObject<AppointmentTableRef | null>;
  selectedAppointmentIds: string[];
  setSelectedAppointmentIds: Dispatch<SetStateAction<string[]>>;
};

export default function UpcomingTab({
  appointmentTableRef,
  selectedAppointmentIds,
  setSelectedAppointmentIds,
}: UpcomingTabProps) {
  return (
    <div className="pt-4">
      <AppointmentTable
        filter="upcoming"
        ref={appointmentTableRef}
        selectedAppointmentIds={selectedAppointmentIds}
        setSelectedAppointmentIds={setSelectedAppointmentIds}
      />
    </div>
  );
}
