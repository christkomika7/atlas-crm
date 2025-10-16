"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { AppointmentType } from "@/types/appointment.type";
import { all } from "@/action/appointment.action";
import { dropdownMenu } from "./table";
import { cutText } from "@/lib/utils";

type AppointmentTableProps = {
  filter: "upcoming" | "past";
  selectedAppointmentIds: string[];
  setSelectedAppointmentIds: Dispatch<SetStateAction<string[]>>;
};

export interface AppointmentTableRef {
  refreshAppointment: () => void;
}

const AppointmentTable = forwardRef<AppointmentTableRef, AppointmentTableProps>(
  ({ selectedAppointmentIds, setSelectedAppointmentIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();

    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: "upcoming" | "past" },
      RequestResponse<AppointmentType[]>
    >(all, () => {}, "appointments");

    const toggleSelection = (appointmentId: string, checked: boolean) => {
      setSelectedAppointmentIds((prev) =>
        checked
          ? [...prev, appointmentId]
          : prev.filter((id) => id !== appointmentId)
      );
    };

    const refreshAppointment = () => {
      if (id) {
        mutate({ companyId: id, filter });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshAppointment,
    }));

    useEffect(() => {
      refreshAppointment();
    }, [id]);

    const isSelected = (id: string) => selectedAppointmentIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Email</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Heure</TableHead>
              <TableHead className="font-medium text-center">Adresse</TableHead>
              <TableHead className="font-medium text-center">
                Objet de la réunion
              </TableHead>
              <TableHead className="font-medium text-center">
                Membre de l'équipe
              </TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((appointment) => (
                <TableRow
                  key={appointment.id}
                  className={`h-16 transition-colors ${
                    isSelected(appointment.id) ? "bg-neutral-100" : ""
                  }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(appointment.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(appointment.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {appointment.client.firstname} {appointment.client.lastname}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {appointment.email}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(appointment.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {appointment.time}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {appointment.address}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(appointment.subject, 20)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {appointment.teamMemberName}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={appointment.id}
                      refreshClients={refreshAppointment}
                      deleteTitle="Confirmer la suppression du rendez-vous"
                      deleteMessage={
                        <p>
                          En supprimant un rendez-vous client, toutes les
                          informations liées seront également supprimées.
                          <br />
                          <span className="font-semibold text-red-600">
                            Cette action est irréversible.
                          </span>
                          <br />
                          <br />
                          Confirmez-vous cette suppression ?
                        </p>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-6 text-gray-500 text-sm text-center"
                >
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

AppointmentTable.displayName = "AppointmentTable";

export default AppointmentTable;
