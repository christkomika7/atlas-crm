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
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { AppointmentType, GetAppointmentsParams, SortField } from "@/types/appointment.type";
import { all as fetchAllAppointments } from "@/action/appointment.action";
import { dropdownMenu } from "./table";
import { cutText } from "@/lib/utils";
import Paginations from "@/components/paginations";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import {
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { isToday } from "date-fns";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

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
    const companyId = useDataStore.use.currentCompany();

    const [appointments, setAppointments] = useState<AppointmentType[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);

    const [sortField, setSortField] = useState<SortField>("byDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const { access: readAccess, loading } = useAccess("APPOINTMENT", "READ");

    const { mutate: mutateGetAppointments, isPending } = useQueryAction<
      GetAppointmentsParams,
      RequestResponse<AppointmentType[]>
    >(fetchAllAppointments, () => { }, "appointments");

    const toggleSelection = (appointmentId: string, checked: boolean) => {
      setSelectedAppointmentIds((prev) =>
        checked ? [...prev, appointmentId] : prev.filter((id) => id !== appointmentId)
      );
    };

    const isSelected = (id: string) => selectedAppointmentIds.includes(id);

    const buildSortParams = (field: SortField, order: "asc" | "desc") => ({
      [field]: order,
    });

    const loadAppointments = useCallback(
      (page: number) => {
        if (!companyId) return;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const params: any = {
          companyId,
          type: filter,
          skip,
          take,
          ...buildSortParams(sortField, sortOrder),
        };

        mutateGetAppointments(params, {
          onSuccess(res) {
            const items = (res as any)?.data ?? [];
            const total =
              (res as any)?.total ??
              (res as any)?.meta?.totalItems ??
              (Array.isArray(items) ? items.length : 0);

            setAppointments(items);
            setTotalItems(typeof total === "number" ? total : 0);
          },
        });
      },
      [companyId, pageSize, filter, sortField, sortOrder, mutateGetAppointments, readAccess]
    );

    const handleSort = useCallback(
      (field: SortField) => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field) newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);
        setCurrentPage(1);
      },
      [sortField, sortOrder]
    );

    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) return <ChevronsUpDownIcon className="size-3.5" />;
      return sortOrder === "asc" ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />;
    };

    useImperativeHandle(ref, () => ({
      refreshAppointment: () => loadAppointments(currentPage),
    }));

    useEffect(() => {
      if (companyId && readAccess) {
        loadAppointments(currentPage);
      }
    }, [companyId, currentPage, pageSize, sortField, sortOrder, filter, loadAppointments, readAccess]);

    const refreshAppointment = () => {
      loadAppointments(currentPage);
    };

    const isAppointmentToday = (date: string | Date | number) => {
      try {
        return isToday(new Date(date));
      } catch {
        return false;
      }
    };

    if (loading) return <Spinner />

    return (
      <AccessContainer hasAccess={readAccess} resource="APPOINTMENT" >
        <div className="border border-neutral-200 rounded-xl flex flex-col">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="min-w-[50px] font-medium" />
                {[
                  { label: "Société", field: "byCompany" as SortField },
                  { label: "Client", field: "byClient" as SortField },
                  { label: "Email", field: "byEmail" as SortField },
                  { label: "Date", field: "byDate" as SortField },
                  { label: "Heure", field: "byTime" as SortField },
                  { label: "Adresse", field: "byAddress" as SortField },
                  { label: "Objet de la réunion", field: "bySubject" as SortField },
                  { label: "Membre de l'équipe", field: "byTeamMember" as SortField },
                  { label: "Action", field: null },
                ].map((col, idx) => (
                  <TableHead key={idx} className="font-medium text-center">
                    {col.field ? (
                      <span
                        className="flex items-center text-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort(col.field!)}
                      >
                        {col.label}
                        <span className="text-neutral-400">{renderSortIcon(col.field!)}</span>
                      </span>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                ))}
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
              ) : appointments && appointments.length > 0 ? (
                appointments.map((appointment) => {
                  const highlightToday = isAppointmentToday(appointment.date);
                  const rowClass = `h-16 transition-colors ${isSelected(appointment.id)
                    ? "bg-neutral-100"
                    : highlightToday
                      ? "bg-emerald-50 ring-1 ring-emerald-200"
                      : ""
                    }`;

                  return (
                    <TableRow key={appointment.id} className={rowClass}>
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
                        {appointment.client.companyName}
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
                          refreshAppointment={refreshAppointment}
                          deleteTitle="Confirmer la suppression du rendez-vous"
                          deleteMessage={
                            <p>
                              En supprimant un rendez-vous client, toutes les informations
                              liées seront également supprimées.
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-6 text-gray-500 text-sm text-center"
                  >
                    Aucun rendez-vous trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between p-4">
            <div />
            <div className="flex items-center gap-3">
              <Paginations
                totalItems={totalItems}
                pageSize={pageSize}
                controlledPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
                maxVisiblePages={DEFAULT_PAGE_SIZE}
              />
            </div>
          </div>
        </div>
      </AccessContainer>
    );
  }
);

AppointmentTable.displayName = "AppointmentTable";

export default AppointmentTable;
