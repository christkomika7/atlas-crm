import { all as getAllBillboards } from "@/action/billboard.action";
import { createContract } from "@/action/contract.action";
import { all as getAllSuppliers } from "@/action/supplier.action";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { lessorContractSchema, LessorContractSchemaType } from "@/lib/zod/contract.schema";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { ClientContractType, LessorContractType } from "@/types/contract-types";
import { SupplierType } from "@/types/supplier.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type LessorContractCreateProps = {
    refreshContract: () => void;
    closeModal: () => void
}

export default function LessorContractCreate({ refreshContract, closeModal }: LessorContractCreateProps) {
    const companyId = useDataStore.use.currentCompany();

    const [lessors, setLessors] = useState<SupplierType[]>([]);
    const [billboards, setBillboards] = useState<BillboardType[]>([]);

    const form = useForm<LessorContractSchemaType>({
        resolver: zodResolver(lessorContractSchema),
        defaultValues: {
            type: "LESSOR"
        }
    });

    const { mutate: mutateCreateLessorContract, isPending: isCreatingLessorContract } = useQueryAction<
        LessorContractSchemaType,
        RequestResponse<ClientContractType | LessorContractType>
    >(createContract, () => { }, "contract");

    const { mutate: mutateGetSuppliers, isPending: isGettingSuppliers } = useQueryAction<
        { id: string },
        RequestResponse<SupplierType[]>
    >(getAllSuppliers, () => { }, "suppliers");


    const { mutate: mutateGetBillboards, isPending: isGettingBillboards } = useQueryAction<
        { companyId: string },
        RequestResponse<BillboardType[]>
    >(getAllBillboards, () => { }, "billboards");


    useEffect(() => {
        if (companyId) {
            form.setValue('company', companyId);

            mutateGetSuppliers({ id: companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setLessors(data.data);
                    }
                },
            })

            mutateGetBillboards({ companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setBillboards(data.data);
                    }
                },
            })
        }
    }, [companyId])

    async function submit(contractData: LessorContractSchemaType) {
        const { success, data } = lessorContractSchema.safeParse(contractData);
        if (!success) return;
        if (companyId) {
            mutateCreateLessorContract(
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
                <div className="space-y-4.5 max-w-full">
                    <FormField
                        control={form.control}
                        name="lessor"
                        render={({ field }) => (
                            <FormItem className="-space-y-2">
                                <FormControl>
                                    <Combobox
                                        isLoading={isGettingSuppliers}
                                        datas={lessors.map((lessor) => ({
                                            id: lessor.id,
                                            label: `${lessor.lastname} ${lessor.firstname}`,
                                            value: lessor.id,
                                        }))}
                                        required={false}
                                        value={field.value as string}
                                        setValue={field.onChange}
                                        placeholder="Bailleur"
                                        searchMessage="Rechercher un bailleur"
                                        noResultsMessage="Aucun bailleur trouvé."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="billboard"
                        render={({ field }) => (
                            <FormItem className="-space-y-2">
                                <FormControl>
                                    <Combobox
                                        isLoading={isGettingBillboards}
                                        datas={billboards.map((billboard) => ({
                                            id: billboard.id,
                                            label: `${billboard.name}`,
                                            value: billboard.id,
                                        }))}
                                        value={field.value as string}
                                        setValue={field.onChange}
                                        placeholder="Panneau d'affichage"
                                        searchMessage="Rechercher un panneau"
                                        noResultsMessage="Aucun panneau trouvé."
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
                        className="justify-center"
                        disabled={isCreatingLessorContract}
                    >
                        {isCreatingLessorContract ? <Spinner /> : "Enregistrer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
