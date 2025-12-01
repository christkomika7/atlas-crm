'use client';

import { all as getAllClients } from "@/action/client.action";
import { createContract } from "@/action/contract.action";
import { all as getAllInvoices } from "@/action/invoice.action";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import Spinner from "@/components/ui/spinner";
import { INVOICE_PREFIX } from "@/config/constant";
import useQueryAction from "@/hook/useQueryAction";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { clientContractSchema, ClientContractSchemaType } from "@/lib/zod/contract.schema";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { DataContractType } from "@/types/contract-types";
import { InvoiceType } from "@/types/invoice.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type ClientContractCreateProps = {
    refreshContract: () => void;
    closeModal: () => void
}

export default function ClientContractCreate({ refreshContract, closeModal }: ClientContractCreateProps) {
    const companyId = useDataStore.use.currentCompany();

    const [clientId, setClientId] = useState("");
    const [clients, setClients] = useState<ClientType[]>([]);
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);

    const form = useForm<ClientContractSchemaType>({
        resolver: zodResolver(clientContractSchema),
        defaultValues: {
            type: "CLIENT"
        }
    });

    const { mutate: mutateCreateClientContract, isPending: isCreatingClientContract } = useQueryAction<
        ClientContractSchemaType,
        RequestResponse<DataContractType>
    >(createContract, () => { }, "contract");

    const { mutate: mutateGetClients, isPending: isGettingClients } = useQueryAction<
        { id: string, filter: string },
        RequestResponse<ClientType[]>
    >(getAllClients, () => { }, "clients");


    const { mutate: mutateGetInvoices, isPending: isGettingInvoices } = useQueryAction<
        { companyId: string, filter: 'contract', client: string },
        RequestResponse<InvoiceType[]>
    >(getAllInvoices, () => { }, "invoices");


    useEffect(() => {
        if (companyId) {
            form.setValue('company', companyId);

            mutateGetClients({ id: companyId, filter: 'contract' }, {
                onSuccess(data) {
                    if (data.data) {
                        setClients(data.data);
                    }
                },
            })
        }
    }, [companyId])

    useEffect(() => {
        if (clientId) {
            mutateGetInvoices({ companyId, filter: 'contract', client: clientId }, {
                onSuccess(data) {
                    if (data.data) {
                        setInvoices(data.data);
                    }
                },
            })
        }

    }, [clientId])

    async function submit(contractData: ClientContractSchemaType) {
        const { success, data } = clientContractSchema.safeParse(contractData);
        if (!success) return;
        if (companyId) {
            mutateCreateClientContract(
                { ...data },
                {
                    onSuccess() {
                        form.reset();
                        refreshContract();
                        closeModal();
                    },
                }
            );
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
                <div className="space-y-4.5 grid-cols-1 grid">
                    <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                            <FormItem className="-space-y-2">
                                <FormControl>
                                    <Combobox
                                        isLoading={isGettingClients}
                                        datas={clients.map((client) => ({
                                            id: client.id,
                                            label: `${client.companyName}`,
                                            value: client.id,
                                        }))}
                                        value={field.value}
                                        setValue={e => {
                                            field.onChange(e);
                                            setClientId(e);
                                        }}
                                        placeholder="Client"
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
                        name="invoices"
                        render={({ field }) => {
                            const allOptions: Option[] =
                                invoices?.map((invoice) => ({
                                    id: invoice.id,
                                    label: `FACTURE ${invoice.company.documentModel.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)} ( ${formatNumber(invoice.amountType === "TTC" ? invoice.totalTTC : invoice.totalHT)} ${invoice.company.currency} )`,
                                    value: invoice.id,
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
                                                    Factures <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            isLoading={isGettingInvoices}
                                            options={allOptions}
                                            value={selectedOptions}
                                            onChange={(options) =>
                                                field.onChange(options.map((opt) => opt.value))
                                            }
                                            placeholder="Sélèction facture(s)"
                                            disabled={isGettingInvoices}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        className="justify-center"
                        disabled={isCreatingClientContract}
                    >
                        {isCreatingClientContract ? <Spinner /> : "Enregistrer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
