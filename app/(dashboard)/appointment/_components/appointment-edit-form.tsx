import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import {
  editAppointmentSchema,
  EditAppointmentSchemaType,
} from "@/lib/zod/appointment.schema";
import { AppointmentType } from "@/types/appointment.type";
import { unique, update } from "@/action/appointment.action";
import { DatePicker } from "@/components/ui/date-picker";
import { all } from "@/action/client.action";
import { ClientType } from "@/types/client.types";
import { useEffect, useState } from "react";
import { downloadFile } from "@/lib/utils";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type AppointmentFormProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onAppointmentAdded?: () => void;
  id: string;
};

export default function AppointmentForm({
  closeModal,
  onAppointmentAdded,
  id,
}: AppointmentFormProps) {
  const [lastUploadDocuments, setLastUploadDocuments] = useState<string[]>([]);
  const form = useForm<EditAppointmentSchemaType>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      id: "",
      client: "",
      company: "",
      email: "",
      date: new Date(),
      time: "00:00",
      subject: "",
      address: "",
      uploadDocuments: undefined,
      lastUploadDocuments: [],
    },
  });

  const {
    mutate: mutateAppointment,
    isPending: isLoadingAppointment,
    data: appointmentData,
  } = useQueryAction<{ id: string }, RequestResponse<AppointmentType>>(
    unique,
    () => {},
    "appointments"
  );

  const {
    mutate: mutateClient,
    isPending: isLoadingClient,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
    all,
    () => {},
    "clients"
  );

  useEffect(() => {
    if (id) {
      mutateAppointment({ id });
    }
  }, [id]);

  useEffect(() => {
    if (appointmentData?.data?.companyId) {
      mutateClient({ id: appointmentData.data.companyId });
    }
  }, [appointmentData]);

  useEffect(() => {
    if (appointmentData?.data) {
      setLastUploadDocuments(
        appointmentData.data.documents.filter((doc) => Boolean(doc))
      );
      const initForm = {
        id: appointmentData.data.id,
        client: appointmentData.data.clientId,
        company: appointmentData.data.companyId,
        email: appointmentData.data.email,
        date: new Date(appointmentData.data.date),
        time: appointmentData.data.time,
        subject: appointmentData.data.subject,
        address: appointmentData.data.address,
        lastUploadDocuments: appointmentData.data.documents.filter((doc) =>
          Boolean(doc)
        ),
      };

      form.reset(initForm);
    }
  }, [form, appointmentData]);

  const { mutate, isPending } = useQueryAction<
    EditAppointmentSchemaType,
    RequestResponse<AppointmentType[]>
  >(update, () => {}, "appointments");

  function removeLastUploadDocuments(name: string) {
    setLastUploadDocuments((prev) => prev.filter((d) => d !== name));
  }

  async function submit(appointmentData: EditAppointmentSchemaType) {
    const { success, data } = editAppointmentSchema.safeParse(appointmentData);
    if (!success) return;
    mutate(
      { ...data, lastUploadDocuments },
      {
        onSuccess() {
          form.reset();
          if (onAppointmentAdded) onAppointmentAdded();
          closeModal(false);
        },
      }
    );
  }

  return (
    <>
      {isLoadingAppointment && (
        <Badge variant="secondary" className="text-sm">
          Chargement des données <Spinner size={12} />
        </Badge>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
          <div className="space-y-4.5 max-w-full">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isLoadingClient}
                      datas={
                        data?.data?.map((client) => ({
                          id: client.id,
                          label: `${client.firstname} ${client.lastname}`,
                          value: client.id,
                        })) ?? []
                      }
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un client"
                      searchMessage="Rechercher un client"
                      noResultsMessage="Aucun client trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="email"
                      design="float"
                      label="Adresse mail"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="gap-x-2 grid grid-cols-2 w-full">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <DatePicker
                        label="Date du rendez-vous"
                        mode="single"
                        value={field.value}
                        onChange={(e) => field.onChange(e as Date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="time"
                        design="float"
                        label="Heure du rendez-vous"
                        value={field.value as string}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="gap-x-2 grid grid-cols-2 w-full">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        required={false}
                        design="float"
                        label="Objet du rendez-vous"
                        value={field.value ?? ""}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Adresse"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="uploadDocuments"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="file"
                      multiple={true}
                      design="float"
                      label="Documents"
                      required={false}
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastUploadDocuments"
              render={() => (
                <FormItem className="-space-y-0.5">
                  <FormLabel>Liste des fichiers enregistrés</FormLabel>
                  <FormControl>
                    <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
                      <ul className="space-y-1 w-full text-sm">
                        {lastUploadDocuments.length > 0 ? (
                          lastUploadDocuments.map((document, index) => {
                            return (
                              <li
                                key={index}
                                className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                              >
                                {index + 1}. {document.split("/").pop()}{" "}
                                <span className="flex items-center gap-x-2">
                                  <span
                                    onClick={() => downloadFile(document)}
                                    className="text-blue cursor-pointer"
                                  >
                                    <DownloadIcon className="w-4 h-4" />
                                  </span>{" "}
                                  <span
                                    onClick={() =>
                                      removeLastUploadDocuments(document)
                                    }
                                    className="text-red cursor-pointer"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </span>{" "}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm">Aucun document trouvé.</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              variant="primary"
              className="justify-center max-w-xs"
            >
              {isPending ? <Spinner /> : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
