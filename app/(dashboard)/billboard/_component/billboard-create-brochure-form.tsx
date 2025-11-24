'use client';

import { all as allAreas, getAreasByCompany } from "@/action/area.action";
import { all as allBillboardType } from "@/action/billboard-type.action";
import { filter } from "@/action/billboard.action";
import { all as allCities } from "@/action/city.action";
import { Button } from "@/components/ui/button";
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
import usePdfStore from "@/stores/pdf.store";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { BaseType } from "@/types/base.types";

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

  const form = useForm<ContractSchemaType>({
    resolver: zodResolver(contractSchema),
    defaultValues: {},
  });

  const {
    mutate: mutateArea,
    isPending: isPendingArea,
    data: areas,
  } = useQueryAction<{ companyId: string }, RequestResponse<AreaType[]>>(
    getAreasByCompany,
    () => { },
    "areas"
  );

  const {
    mutate: mutateBillboardType,
    isPending: isPendingBillboardType,
    data: billboardsType,
  } = useQueryAction<
    { companyId: string },
    RequestResponse<BaseType[]>
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
      mutateArea({ companyId });
    }
  }, [companyId]);


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
              render={({ field }) => {
                const allOptions: Option[] =
                  billboardsType?.data?.map((billboardType) => ({
                    id: billboardType.id,
                    label: billboardType.name,
                    value: billboardType.id,
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
                            Type de panneau <span className="text-red-500">*</span>
                          </span>
                        }
                        isLoading={isPendingArea}
                        options={allOptions}
                        value={selectedOptions}
                        onChange={(options) =>
                          field.onChange(options.map((opt) => opt.value))
                        }
                        placeholder="Sélèctionner des types de panneau"
                        disabled={isPendingBillboardType}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => {
                const allOptions: Option[] =
                  cities?.data?.map((city) => ({
                    id: city.id,
                    label: city.name,
                    value: city.id,
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
                            Ville <span className="text-red-500">*</span>
                          </span>
                        }
                        isLoading={isPendingArea}
                        options={allOptions}
                        value={selectedOptions}
                        onChange={(options) =>
                          field.onChange(options.map((opt) => opt.value))
                        }
                        placeholder="Sélèctionner des villes"
                        disabled={isPendingCity}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
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
                        disabled={isPendingArea}
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
