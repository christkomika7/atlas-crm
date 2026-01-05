"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multi-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { formatDateToDashModel } from "@/lib/date";
import { renderComponentToPDF } from "@/lib/pdf";
import { formatNumber } from "@/lib/utils";
import { RequestResponse } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import { share } from "@/action/supplier.action";
import RevenueRecord from "@/components/pdf/revenue-record";
import { useDataStore } from "@/stores/data.store";
import { SupplierRevenueType } from "@/types/supplier.types";
import useSupplierStore from "@/stores/supplier.store";

type ShareRevenueProps = {
  revenues?: SupplierRevenueType;
  isLoading: boolean;
}

export default function ShareRevenue({ revenues, isLoading }: ShareRevenueProps) {
  const company = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();
  const supplier = useSupplierStore.use.supplier();

  const { access: readAccess, loading } = useAccess("SUPPLIERS", "READ");
  const { access: modifyAccess } = useAccess("SUPPLIERS", "MODIFY");

  const form = useForm<RecordEmailSchemaType>({
    resolver: zodResolver(recordEmailSchema),
    defaultValues: {},
  });

  const { mutate: mutateShareRevenue, isPending: isSharingRevenue } =
    useQueryAction<RecordEmailSchemaType, RequestResponse<null>>(
      share,
      () => { },
      "share",
    );

  useEffect(() => {
    if (revenues) {
      const now = new Date();
      form.setValue('emails', [revenues.supplier.email]);
      form.setValue('recordId', revenues.supplier.id);
      form.setValue('companyId', company);
      form.setValue('filename', `Relevé ${revenues?.supplier.companyName} du ${formatDateToDashModel(revenues?.startDate || new Date())} au ${formatDateToDashModel(revenues?.endDate || new Date())}`)
      form.setValue('start', (new Date(revenues?.startDate || now)).toISOString());
      form.setValue('end', new Date(revenues?.endDate || now).toISOString());
      async function convertPdfToFile() {
        const pdfData = await renderComponentToPDF(
          <RevenueRecord
            type="supplier-revenue-record"
            id="supplier-revenue-record"
            firstColor={revenues?.supplier.company.documentModel.primaryColor || "#fbbf24"}
            secondColor={revenues?.supplier.company.documentModel.secondaryColor || "#fef3c7"}
            logo={revenues?.supplier.company.documentModel.logo}
            logoSize={revenues?.supplier.company.documentModel.size || "Medium"}
            logoPosition={revenues?.supplier.company.documentModel.position || "Center"}
            revenue={revenues as SupplierRevenueType}
            isLoading={isLoading}
          />
          , {
            padding: 0,
            margin: 0,
            quality: 0.98,
            scale: 4,
          })
        const blob = new Blob([pdfData], { type: "application/pdf" });
        form.setValue("blob", blob);
      }

      convertPdfToFile()
    }
  }, [revenues])


  function submit(formData: RecordEmailSchemaType) {
    const { success, data } = recordEmailSchema.safeParse(formData);
    if (success) {
      mutateShareRevenue(data);
    }
  }

  return (
    <AccessContainer loading={loading} resource='SUPPLIERS' hasAccess={readAccess}>
      <ScrollArea className="pr-4 min-h-[450px]">
        {isLoading ? <Spinner /> :
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}

            >
              <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
                <div className="space-y-4">

                  <div className="space-y-4.5 m-2 max-w-xl">
                    <FormField
                      control={form.control}
                      name="emails"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <MultipleSelector
                              disabled={!modifyAccess}
                              value={
                                field?.value?.map((v) => ({ label: v, value: v })) ??
                                []
                              }
                              placeholder="Destinataires"
                              onChange={(options) =>
                                field.onChange(options.map((opt) => opt.value))
                              }
                              creatable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              disabled={!modifyAccess}
                              required={false}
                              design="float"
                              label="Objet"
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
                      name="message"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              disabled={!modifyAccess}
                              required={false}
                              design="text-area"
                              label="Message (optionnel)"
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
                      name="file"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              type="file"
                              design="float"
                              required={false}
                              disabled={!modifyAccess}
                              label="Pièces jointes supplémentaires"
                              value={field.value}
                              multiple={true}
                              handleChange={field.onChange}
                              showFileData={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
                <div className='space-y-4'>
                  <div className='pb-8 border-b border-neutral-400'>
                    <h2 className='text-2xl font-semibold mb-4'>Relevé</h2>
                    <div className='flex justify-between gap-x-2 mb-2'>
                      <h2 className='font-medium'>Date</h2> <p className='text-sm text-neutral-600'>{formatDateToDashModel(new Date())}</p>
                    </div>
                    <div className='flex justify-between gap-x-2'>
                      <h2 className='font-medium'>Fournisseur</h2> <p className='text-sm text-neutral-600'>{supplier?.firstname} {supplier?.lastname} ({supplier?.companyName})</p>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between gap-x-2'>
                      <h2 className='font-medium'>Total TTC</h2>  {formatNumber(revenues?.totalTTC || 0)} {currency}
                    </div>
                    <div className='flex items-center justify-between gap-x-2'>
                      <h2 className='font-medium'>Payée</h2> {formatNumber(revenues?.totalPaid || 0)} {currency}
                    </div>
                    <div className='flex items-center justify-between gap-x-2'>
                      <h2 className='font-medium'>Solde</h2> {formatNumber(Number(revenues?.totalDue || 0) - Number(revenues?.totalPaid || 0))} {currency}
                    </div>

                  </div>
                  <Button variant="primary">{isSharingRevenue ? <Spinner /> : "Partger"}</Button>
                </div>
              </div>
            </form>
          </Form>
        }
      </ScrollArea>
    </AccessContainer>
  );
}
