import { all as getAllInvoices } from "@/action/invoice.action";
import { getUniqueContract, updateContract } from "@/action/contract.action";
import { all as getAllClients } from "@/action/client.action";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { $Enums } from "@/lib/generated/prisma";
import { clientContractSchema, ClientContractSchemaType } from "@/lib/zod/contract.schema";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { ClientContractType, LessorContractType } from "@/types/contract-types";
import { InvoiceType } from "@/types/invoice.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MultipleSelect, Option } from "@/components/ui/multi-select";
import { INVOICE_PREFIX } from "@/config/constant";
import { formatNumber, generateAmaId } from "@/lib/utils";

type ClientContractEditProps = {
    id: string;
    refreshContract: () => void;
    closeModal: () => void
}

export default function ClientContractEdit({ id, refreshContract, closeModal }: ClientContractEditProps) {
    const companyId = useDataStore.use.currentCompany();

    const [clients, setClients] = useState<ClientType[]>([]);
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);

    const form = useForm<ClientContractSchemaType>({
        resolver: zodResolver(clientContractSchema),
        defaultValues: {
            type: "CLIENT"
        }
    });

    const { mutate: mutateUpdateClientContract, isPending: isUpdatingClientContract } = useQueryAction<
        ClientContractSchemaType,
        RequestResponse<ClientContractType | LessorContractType>
    >(updateContract, () => { }, "contract");


    const { mutate: mutateGetClientContracts, isPending: isGettingClientContracts } = useQueryAction<
        { id: string, filter: $Enums.ContractType },
        RequestResponse<ClientContractType | LessorContractType>
    >(getUniqueContract, () => { }, "contract");

    const { mutate: mutateGetClient, isPending: isGettingClients } = useQueryAction<
        { id: string },
        RequestResponse<ClientType[]>
    >(getAllClients, () => { }, "clients");


    const { mutate: mutateGetInvoices, isPending: isGettingInvoices } = useQueryAction<
        { companyId: string },
        RequestResponse<InvoiceType[]>
    >(getAllInvoices, () => { }, "invoices");

    useEffect(() => {
        if (id) {
            mutateGetClientContracts({ id, filter: "LESSOR" }, {
                onSuccess(data) {
                    if (data.data) {
                        const clientContrat = data.data as ClientContractType;
                        console.log({ clientContrat })
                        form.setValue("id", id);
                        form.setValue("client", clientContrat.clientId);
                        form.setValue("invoices", clientContrat.invoices.map(invoice => invoice.id));
                    }
                },
            })
        }

    }, [id])


    useEffect(() => {
        if (companyId) {
            form.setValue('company', companyId);

            mutateGetClient({ id: companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setClients(data.data);
                    }
                },
            })

            mutateGetInvoices({ companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setInvoices(data.data);
                    }
                },
            })
        }
    }, [companyId])

    async function submit(contractData: ClientContractSchemaType) {
        const { success, data } = clientContractSchema.safeParse(contractData);
        if (!success) return;
        if (companyId) {
            mutateUpdateClientContract(
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

    if (isGettingClientContracts) return <Spinner />

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
                                            label: `${client.lastname} ${client.firstname}`,
                                            value: client.id,
                                        }))}
                                        value={field.value}
                                        setValue={field.onChange}
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
                        disabled={isUpdatingClientContract}
                    >
                        {isUpdatingClientContract ? <Spinner /> : "Valider"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
