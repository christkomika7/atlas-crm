"use client";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import useTransactionStore from "@/stores/transaction.store";
import { SourceType, TransactionType } from "@/types/transaction.type";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { createTransfer, getSources } from "@/action/transaction.action";
import { transferSchema, TransferSchemaType } from "@/lib/zod/transfert.schema";


type TransferFormProps = {
    refreshTransaction: () => void
    closeModal: () => void;
}

export default function TransferForm({ refreshTransaction, closeModal }: TransferFormProps) {
    const companyId = useDataStore.use.currentCompany();

    const sources = useTransactionStore.use.sources();
    const setSources = useTransactionStore.use.setSources();

    const [originId, setOriginId] = useState("");

    const form = useForm<TransferSchemaType>({
        resolver: zodResolver(transferSchema)
    });

    const {
        mutate: mutateGetSources,
        isPending: isGettingSources,
    } = useQueryAction<{ companyId: string, type?: "cash" | "check" | "bank-transfer" | "all" }, RequestResponse<SourceType[]>>(
        getSources,
        () => { },
        "sources"
    );


    const { mutate: mutateCreateTransfer, isPending: isCreatingTransfer } = useQueryAction<
        TransferSchemaType,
        RequestResponse<TransactionType>
    >(createTransfer, () => { }, "dibursement");


    useEffect(() => {
        if (companyId) {
            mutateGetSources({ companyId, type: "all" }, {
                onSuccess(data) {
                    if (data.data) {
                        setSources(data.data)
                    }
                },
            });

            form.reset({
                companyId,
                date: new Date(),
            });
        }
    }, [companyId]);

    async function submit(transferData: TransferSchemaType) {
        const { success, data } = transferSchema.safeParse(transferData);
        if (!success) return;
        mutateCreateTransfer(
            { ...data },
            {
                onSuccess() {
                    form.reset();
                    refreshTransaction();
                    closeModal();
                },
            }
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">

                <div className="space-y-4.5 max-w-full">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="-space-y-2">
                                <FormControl>
                                    <DatePicker
                                        value={field.value}
                                        label="Date"
                                        mode="single"
                                        onChange={(e) => field.onChange(e as Date)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="gap-4.5 grid grid-cols-3">
                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem className="-space-y-2">
                                    <FormControl>
                                        <Combobox
                                            isLoading={isGettingSources}
                                            datas={sources.map(source => ({
                                                id: source.id,
                                                label: source.name,
                                                value: source.id
                                            }))}
                                            value={field.value}
                                            setValue={e => {
                                                setOriginId(e)
                                                field.onChange(e)
                                            }}
                                            placeholder="Source d’origine"
                                            searchMessage="Rechercher une source"
                                            noResultsMessage="Aucune source trouvée."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem className="-space-y-2">
                                    <FormControl>
                                        <Combobox
                                            disabled={!originId}
                                            isLoading={isGettingSources}
                                            datas={sources.filter(source => source.id !== originId).map(source => ({
                                                id: source.id,
                                                label: source.name,
                                                value: source.id
                                            }))}
                                            value={field.value}
                                            setValue={field.onChange}
                                            placeholder="Source de destination"
                                            searchMessage="Rechercher une source"
                                            noResultsMessage="Aucune source trouvée."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-x-2">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2 w-full">
                                        <FormControl>
                                            <TextInput
                                                type="number"
                                                design="float"
                                                label="Montant"
                                                className="w-full"
                                                value={field.value}
                                                handleChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center max-h-11 space-x-2">
                                <Label
                                    htmlFor="HT"
                                    className="flex px-3 py-1 rounded-md h-full bg-blue text-white"

                                >
                                    HT
                                </Label>
                            </div>
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="information"
                        render={({ field }) => (
                            <FormItem className="-space-y-2">
                                <FormControl>
                                    <TextInput
                                        type="text"
                                        design="text-area"
                                        label="Information"
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
                        {isCreatingTransfer ? <Spinner /> : "Enregistrer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
