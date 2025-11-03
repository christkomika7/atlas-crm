import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { clientSchema, ClientSchemaType } from "@/lib/zod/client.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { create } from "@/action/client.action";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { businessSectors, discount, paymentTerms } from "@/lib/data";
import { useDataStore } from "@/stores/data.store";
import { ClientType } from "@/types/client.types";

type ClientFormProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onClientAdded?: () => void;
};

export default function ClientForm({
  closeModal,
  onClientAdded,
}: ClientFormProps) {
  const id = useDataStore.use.currentCompany();

  const form = useForm<ClientSchemaType>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: "",
      lastname: "",
      firstname: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      businessSector: "",
      businessRegistrationNumber: "",
      taxIdentificationNumber: "",
      discount: "",
      paymentTerms: "",
      information: "",
    },
  });

  const { mutate, isPending } = useQueryAction<
    ClientSchemaType & { id: string },
    RequestResponse<ClientType[]>
  >(create, () => { }, "clients");

  async function submit(userData: ClientSchemaType) {
    const { success, data } = clientSchema.safeParse(userData);
    if (!success) return;
    if (id) {
      mutate(
        { ...data, id },
        {
          onSuccess() {
            form.reset();
            if (onClientAdded) {
              onClientAdded();
            }
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
            name="companyName"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    design="float"
                    label="Nom de l'entreprise"
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
              name="firstname"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Prénom"
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
              name="lastname"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Nom"
                      value={field.value}
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
              name="phone"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro de téléphone"
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
          </div>

          <div className="gap-x-2 grid grid-cols-3 w-full">
            <FormField
              control={form.control}
              name="businessSector"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={businessSectors}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Secteur d'activité"
                      searchMessage="Rechercher un secteur d'activité"
                      noResultsMessage="Aucun secteur d'activité trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      required={false}
                      design="float"
                      label="Site internet"
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
                      label="Adresse enregistrée"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="gap-x-2 grid grid-cols-3 w-full">
            <FormField
              control={form.control}
              name="businessRegistrationNumber"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro d'immatriculation (RCCM)"
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
              name="taxIdentificationNumber"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Numéro d'identification fiscale (NIF)"
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
              name="discount"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={discount}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Réduction"
                      searchMessage="Rechercher une réduction"
                      noResultsMessage="Aucune réduction trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <Combobox
                    datas={paymentTerms}
                    value={field.value}
                    setValue={field.onChange}
                    placeholder="Conditions de paiement"
                    searchMessage="Rechercher une condition de paiement"
                    noResultsMessage="Aucune condition trouvé."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="gap-x-2 grid grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="information"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Information supplémentaire"
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
