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
import { CityType } from "@/types/city.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import usePdfStore from "@/stores/pdf.store";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { BaseType } from "@/types/base.types";
import { toast } from "sonner";
import { mergePdfsFromUrls } from "@/lib/pdf";

type BillboardCreateBrochureFormProps = {
  close: () => void;
  onSendEmail?: () => void;
};

export default function BillboardCreateBrochureForm({
  close,
  onSendEmail,
}: BillboardCreateBrochureFormProps) {
  const [loadingAction, setLoadingAction] = useState<"download" | "send" | null>(null);
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
    useQueryAction<ContractSchemaType, RequestResponse<string[]>>(
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

  function downloadPdf(blob: Blob, filename = "brochure.pdf") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }


  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }


  async function submit(contractData: ContractSchemaType) {
    const { success, data } = contractSchema.safeParse(contractData);
    if (!success || !action) return;

    setLoadingAction(action);

    mutateBilboardFilter(data, {
      async onSuccess(response) {
        try {
          if (!response.data?.length) {
            toast.error("Aucun PDF trouvé pour ce filtre.");
            return;
          }

          const validBrochures = response.data.filter(
            (url) => typeof url === "string" && url.trim() !== ""
          );

          if (!validBrochures.length) {
            toast.error("Aucune URL de PDF valide trouvée.");
            return;
          }

          const mergedPdfBlob = await mergePdfsFromUrls(validBrochures);

          if (action === "download") {
            downloadPdf(mergedPdfBlob, "brochures.pdf");
            toast.success("PDF téléchargé avec succès !");
          }

          if (action === "send") {
            const base64Pdf = await blobToBase64(mergedPdfBlob);
            setPdf(base64Pdf);
            close();
            onSendEmail?.();
            toast.success("PDF préparé pour l'envoi !");
          }
        } catch (error) {
          toast.error(
            `Erreur lors de la génération du PDF : ${error instanceof Error ? error.message : "Erreur inconnue"
            }`
          );
        } finally {
          setLoadingAction(null);
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
                      className="max-w-md"

                      label={
                        <span>
                          Type de panneau
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
                      className="max-w-md"
                      label={
                        <span>
                          Ville
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
                      className="max-w-md"
                      label={
                        <span>
                          Quartier
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

        <div className="flex justify-center gap-x-2 pt-2">
          <Button
            type="submit"
            disabled={isPendingBillboardFilter || loadingAction !== null}
            onClick={() => setAction("download")}
            className="justify-center bg-white shadow-none border-2 border-blue max-w-xs text-blue"
          >
            {loadingAction === "download" ? <Spinner /> : "Télécharger le PDF"}
          </Button>
          <Button
            type="submit"
            disabled={isPendingBillboardFilter || loadingAction !== null}
            onClick={() => setAction("send")}
            className="justify-center max-w-xs"
          >
            {loadingAction === "send" ? <Spinner /> : "Envoyer via email"}
          </Button>

        </div>
      </form>
    </Form>
  );
}
