import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { useDataStore } from "@/stores/data.store";
import {
  appointmentSchema,
  AppointmentSchemaType,
} from "@/lib/zod/appointment.schema";
import { AppointmentType } from "@/types/appointment.type";
import { create } from "@/action/appointment.action";
import { DatePicker } from "@/components/ui/date-picker";
import { all } from "@/action/client.action";
import { ClientType } from "@/types/client.types";
import { useEffect } from "react";

type AppointmentFormProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onAppointmentAdded?: () => void;
};

export default function AppointmentForm({
  closeModal,
  onAppointmentAdded,
}: AppointmentFormProps) {
  const id = useDataStore.use.currentCompany();

  const form = useForm<AppointmentSchemaType>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {},
  });

  const {
    mutate: mutateClient,
    isPending: isLoadingClient,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
    all,
    () => { },
    "clients"
  );

  useEffect(() => {
    if (id) {
      mutateClient({ id });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const initForm = {
        company: id,
      };

      form.reset(initForm);
    }
  }, [form, id]);

  const { mutate, isPending } = useQueryAction<
    AppointmentSchemaType,
    RequestResponse<AppointmentType[]>
  >(create, () => { }, "appointments");

  async function submit(appointmentData: AppointmentSchemaType) {
    const { success, data } = appointmentSchema.safeParse(appointmentData);
    if (!success) return;
    if (id) {
      mutate(
        { ...data },
        {
          onSuccess() {
            form.reset();
            if (onAppointmentAdded) onAppointmentAdded();
            closeModal(false);
          },
        }
      );
    }
  }

  return (
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
                      value={field.value}
                      handleChange={(e) => {
                        field.onChange(e);
                      }}
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
                      design="float"
                      label="Objet du rendez-vous"
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
  );
}
