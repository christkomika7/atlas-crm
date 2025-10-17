'use client';

import { all as allAreas } from "@/action/area.action";
import { all as allBillboardType } from "@/action/billboard-type.action";
import { filter } from "@/action/billboard.action";
import { all as allCities } from "@/action/city.action";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { contractSchema, ContractSchemaType } from "@/lib/zod/contract.schema";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { AreaType } from "@/types/area.types";
import { BillboardType } from "@/types/billboard.types";
import { CityType } from "@/types/city.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";
import ContractPDF from "./brochure-pdf";
import usePdfStore from "@/stores/pdf.store";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { BillboardTypeType } from "@/types/billboard-type.types";
import BrochurePDF from "./brochure-pdf";

type BillboardCreateBrochureFormProps = {
  close: () => void;
  onSendEmail?: () => void;
};

export default function BillboardCreateBrochureForm({
  close,
  onSendEmail,
}: BillboardCreateBrochureFormProps) {
  const companyId = useDataStore.use.currentCompany();
  const [action, setAction] = useState<"download" | "send">();
  const setPdf = usePdfStore.use.setPdf();

  const [cityId, setCityId] = useState("");

  const form = useForm<ContractSchemaType>({
    resolver: zodResolver(contractSchema),
    defaultValues: {},
  });

  const {
    mutate: mutateArea,
    isPending: isPendingArea,
    data: areas,
  } = useQueryAction<{ cityId: string }, RequestResponse<AreaType[]>>(
    allAreas,
    () => { },
    "areas"
  );

  const {
    mutate: mutateBillboardType,
    isPending: isPendingBillboardType,
    data: billboardsType,
  } = useQueryAction<
    { companyId: string },
    RequestResponse<BillboardTypeType[]>
  >(allBillboardType, () => { }, "billboardsType");

  const {
    mutate: mutateCity,
    isPending: isPendingCity,
    data: cities,
  } = useQueryAction<{ companyId: string }, RequestResponse<CityType[]>>(
    allCities,
    () => { },
    "cities"
  );

  const { mutate: mutateBilboardFilter, isPending: isPendingBillboardFilter } =
    useQueryAction<ContractSchemaType, RequestResponse<BillboardType[]>>(
      filter,
      () => { },
      "filter-billboard"
    );

  useEffect(() => {
    if (companyId) {
      mutateCity({ companyId });
      mutateBillboardType({ companyId });
    }
  }, [companyId]);

  useEffect(() => {
    if (cityId) {
      mutateArea({ cityId });
    }
  }, [cityId]);

  // <BrochurePDF
  //   data={{
  //     companyName: "Total Energie (TE)",
  //     type: "SA",
  //     capital: "5.000.000 Francs CFA",
  //     rccm: "12345678902",
  //     taxIdentificationNumber: "09876543212",
  //     address: "39 rue de la place, à Libreville, Gabon.",
  //     AdvertiserName: "Paul Dupin",
  //     AdvertiserPost: "Directeur Général",
  //     reference: "Contrat AG-LOC-001",
  //   }}
  // />

  async function submit(contractData: ContractSchemaType) {
    const { success, data } = contractSchema.safeParse(contractData);
    if (!success) return;

    mutateBilboardFilter(data, {
      async onSuccess(data) {
        if (data.data) {
          const billboards = data.data;
          console.log({ billboards });
          switch (action) {
            case "download":
              // await downloadPdf(data.data);
              close(); // Fermer le modal après téléchargement
              break;
            case "send":
              // const document = await getPdfBase64(data.data);
              // setPdf(document);
              close(); // Fermer le modal actuel
              onSendEmail?.(); // Ouvrir le modal d'envoi email
              break;
          }
        }
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <DatePicker
                    label="Durée du contrat"
                    mode="range"
                    value={
                      field.value?.from && field.value?.to
                        ? {
                          from: new Date(field.value.from),
                          to: new Date(field.value.to),
                        }
                        : undefined
                    }
                    onChange={(e) => {
                      const range = e as { from: Date; to: Date };
                      field.onChange({ from: range.from, to: range.to });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="gap-x-2 grid grid-cols-3">
            <FormField
              control={form.control}
              name="billboardType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isPendingBillboardType}
                      datas={
                        billboardsType?.data?.map((billboardType) => ({
                          id: billboardType.id,
                          label: billboardType.name,
                          value: billboardType.id,
                        })) ?? []
                      }
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un type de panneau"
                      searchMessage="Rechercher un type de panneau"
                      noResultsMessage="Aucun type de panneau trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isPendingCity}
                      datas={
                        cities?.data?.map((city) => ({
                          id: city.id,
                          label: city.name,
                          value: city.id,
                        })) ?? []
                      }
                      value={field.value}
                      setValue={(e) => {
                        setCityId(e);
                        field.onChange(e);
                      }}
                      placeholder="Sélectionner une ville"
                      searchMessage="Rechercher une ville"
                      noResultsMessage="Aucune ville trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => {
                const allOptions: Option[] =
                  areas?.data?.map((area) => ({
                    id: area.id,
                    label: area.name,
                    value: area.id,
                  })) ?? [];

                const selectedOptions = allOptions.filter((opt) =>
                  field.value?.includes(opt.value)
                );

                return (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <MultipleSelect
                        label={
                          <span>
                            Quartier <span className="text-red-500">*</span>
                          </span>
                        }
                        isLoading={isPendingArea}
                        options={allOptions}
                        value={selectedOptions}
                        onChange={(options) =>
                          field.onChange(options.map((opt) => opt.value))
                        }
                        placeholder="Sélèctionner des quartiers"
                        disabled={isPendingBillboardFilter}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-x-2 pt-2">
          <Button
            variant="primary"
            disabled={isPendingBillboardFilter}
            onClick={(e) => {
              e.stopPropagation();
              setAction("download");
            }}
            className="justify-center bg-white shadow-none border-2 border-blue max-w-xs text-blue"
          >
            {isPendingBillboardFilter && action === "download" ? (
              <Spinner />
            ) : (
              "Télécharger le pdf"
            )}
          </Button>
          <Button
            disabled={isPendingBillboardFilter}
            variant="primary"
            className="justify-center max-w-xs"
            onClick={() => setAction("send")}
          >
            {isPendingBillboardFilter && action === "send" ? (
              <Spinner />
            ) : (
              "Envoyer via email"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
