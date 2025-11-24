"use client";

import { unique, update } from "@/action/client.action";
import useQueryAction from "@/hook/useQueryAction";
import {
  editClientSchema,
  EditClientSchemaType,
} from "@/lib/zod/client.schema";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { businessSectors, discount, paymentTerms } from "@/lib/data";
import { DownloadIcon, XIcon } from "lucide-react";
import { downloadFile } from "@/lib/utils";

export default function EditClientPage() {
  const [lastUploadDocuments, setLastUploadDocuments] = useState<string[]>([]);
  const param = useParams();

  const form = useForm<EditClientSchemaType>({
    resolver: zodResolver(editClientSchema)
  });

  const {
    mutate,
    isPending: isLoadingData,
    data,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType>>(
    unique,
    () => { },
    "client"
  );

  const { mutate: updateMutate, isPending: isUpdatedData } = useQueryAction<
    EditClientSchemaType,
    RequestResponse<ClientType[]>
  >(update, () => { }, "client");

  useEffect(() => {
    if (param.id) {
      mutate({ id: param.id as string });
    }
  }, [param.id]);

  useEffect(() => {
    if (data?.data) {
      const client = data.data;
      setLastUploadDocuments(client.uploadDocuments);
      const updateDefaultValue = {
        id: client.id,
        companyName: client.companyName,
        lastname: client.lastname,
        firstname: client.firstname,
        job: client.job,
        legalForms: client.legalForms,
        capital: client.capital,
        email: client.email,
        phone: client.phone,
        website: client.website,
        address: client.address,
        businessSector: client.businessSector,
        businessRegistrationNumber: client.businessRegistrationNumber,
        taxIdentificationNumber: client.taxIdentificationNumber,
        discount: client.discount,
        paymentTerms: client.paymentTerms,
        information: client.information,
        lastUploadDocuments: client.uploadDocuments,
      };

      form.reset(updateDefaultValue);
    }
  }, [form, data]);

  function removeLastUploadDocuments(name: string) {
    setLastUploadDocuments((prev) => prev.filter((d) => d !== name));
  }

  async function submit(userData: EditClientSchemaType) {
    const { success, data } = editClientSchema.safeParse(userData);
    if (!success) return;
    if (data.id) {
      updateMutate(
        { ...data, lastUploadDocuments },
        {
          onSuccess() {
            if (param.id as string) {
              mutate({ id: param.id as string });
            }
          },
        }
      );
    }
  }

  if (isLoadingData) return <Spinner />;

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

          <div className="gap-x-2 grid grid-cols-3 w-full">
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
              name="job"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      required={false}
                      design="float"
                      label="Poste"
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
              name="capital"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Capital"
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
          <div className="gap-x-2 grid grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="legalForms"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Statut juridique"
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

          </div>
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
          <FormField
            control={form.control}
            name="lastUploadDocuments"
            render={({ field }) => (
              <FormItem className="-space-y-0.5">
                <FormLabel>Liste des fichiers enregistrés</FormLabel>
                <FormControl>
                  <ul className="space-y-1 bg-gray p-4 border rounded-md w-full text-sm">
                    {lastUploadDocuments.filter((doc) => doc !== "").length >
                      0 ? (
                      lastUploadDocuments.map((document, index) => {
                        return (
                          <li
                            key={index}
                            className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                          >
                            {document.split("/").pop()}{" "}
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
            {isUpdatedData ? <Spinner /> : "Valider"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
