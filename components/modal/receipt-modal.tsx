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
import TextInput from "@/components/ui/text-input";
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn, cutText, formatNumber } from "@/lib/utils";
import { receiptSchema, ReceiptSchemaType } from "@/lib/zod/receipt.schema";
import useQueryAction from "@/hook/useQueryAction";
import { createReceipt, getCategories, getDocuments, getNatures, getSources, getUserActionsByNature } from "@/action/transaction.action";
import { RequestResponse } from "@/types/api.types";
import { SourceType, TransactionCategoryType, TransactionDocument, TransactionNatureType, TransactionType, UserActionType } from "@/types/transaction.type";
import useTransactionStore from "@/stores/transaction.store";
import { acceptPayment } from "@/lib/data";
import Spinner from "@/components/ui/spinner";
import SourceModal from "./source-modal";
import NatureModal from "./nature-modal";
import CategoryModal from "./category-modal";
import { ScrollArea } from "../ui/scroll-area";
import UserActionModal from "./user-action-modal";
import { getallByCompany } from "@/action/project.action";
import { ProjectType } from "@/types/project.types";
import { $Enums } from "@/lib/generated/prisma";


type ReceiptModalProps = {
    closeModal: () => void;
    refreshData: () => void;
}

export default function ReceiptModal({ closeModal, refreshData }: ReceiptModalProps) {
    const companyId = useDataStore.use.currentCompany();

    const categories = useTransactionStore.use.categories();
    const setCategories = useTransactionStore.use.setCategories();
    const natures = useTransactionStore.use.natures();
    const setNatures = useTransactionStore.use.setNatures();
    const sources = useTransactionStore.use.sources();
    const setSources = useTransactionStore.use.setSources();
    const userActions = useTransactionStore.use.userActions();
    const setUserActions = useTransactionStore.use.setUserActions();

    const [categoryId, setCategoryId] = useState("");
    const [documents, setDocuments] = useState<TransactionDocument[]>([]);
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [paymentMode, setPaymentMode] = useState<"cash" | "check" | "bank-transfer">();
    const [natureId, setNatureId] = useState("");
    const [currentAmountType, setCurrentAmountType] = useState<$Enums.AmountType>();
    const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

    const form = useForm<ReceiptSchemaType>({
        resolver: zodResolver(receiptSchema)
    });

    const {
        mutate: mutateGetCategories,
        isPending: isGettingCategories,
    } = useQueryAction<{ companyId: string, type: "receipt" | "dibursement" }, RequestResponse<TransactionCategoryType[]>>(
        getCategories,
        () => { },
        "categories"
    );


    const {
        mutate: mutateGetNature,
        isPending: isGettingNatures,
    } = useQueryAction<{ categoryId: string }, RequestResponse<TransactionNatureType[]>>(
        getNatures,
        () => { },
        "natures"
    );

    const {
        mutate: mutateGetSources,
        isPending: isGettingSources,
    } = useQueryAction<{ companyId: string, type?: "cash" | "check" | "bank-transfer" }, RequestResponse<SourceType[]>>(
        getSources,
        () => { },
        "sources"
    );

    const {
        mutate: mutateGetUserActions,
        isPending: isGettingUserActions,
    } = useQueryAction<{ natureId: string }, RequestResponse<UserActionType[]>>(
        getUserActionsByNature,
        () => { },
        "user-actions"
    );


    const {
        mutate: mutateGetDocuments,
        isPending: isGettingDocuments,
    } = useQueryAction<{ companyId: string, type: "receipt" | "dibursement" }, RequestResponse<TransactionDocument[]>>(
        getDocuments,
        () => { },
        "documents"
    );

    const {
        mutate: mutateGetProjects,
        isPending: isGettingProjects,
    } = useQueryAction<{ companyId: string, projectStatus?: "loading" | "stop" }, RequestResponse<ProjectType[]>>(
        getallByCompany,
        () => { },
        "projects"
    );


    const { mutate: mutateCreateReceipt, isPending: isCreatingReceipt } = useQueryAction<
        ReceiptSchemaType,
        RequestResponse<TransactionType>
    >(createReceipt, () => { }, "receipt");

    useEffect(() => {
        if (companyId) {
            mutateGetCategories({ companyId, type: "receipt" }, {
                onSuccess(data) {
                    if (data.data) {
                        setCategories(data.data)
                    }
                },
            });

            mutateGetProjects({ companyId, projectStatus: "loading" }, {
                onSuccess(data) {
                    if (data.data) {
                        setProjects(data.data);
                    }
                },
            });

            mutateGetSources({ companyId }, {
                onSuccess(data) {
                    if (data.data) {
                        setSources(data.data)
                    }
                },
            });

            mutateGetDocuments({ companyId, type: "dibursement" }, {
                onSuccess(data) {
                    if (data.data) {
                        setDocuments(data.data)
                    }
                },
            });

            form.reset({
                companyId,
                date: new Date(),
                amountType: "HT",
            });
        }
    }, [companyId]);
    useEffect(() => {
        if (!categoryId) {
            setNatures([]);
            setNatureId("");
            return;
        }

        mutateGetNature(
            { categoryId },
            {
                onSuccess: (data) => data.data && setNatures(data.data),
            }
        );
    }, [categoryId]);


    useEffect(() => {
        if (!companyId) return;
        mutateGetSources(
            {
                companyId,
                type: paymentMode,
            },
            {
                onSuccess: (data) => data.data && setSources(data.data),
            }
        );
    }, [paymentMode, companyId]);



    useEffect(() => {
        if (!natureId) {
            setUserActions([]);
            return;
        }

        mutateGetUserActions(
            { natureId },
            {
                onSuccess: (data) => data.data && setUserActions(data.data),
            }
        );
    }, [natureId]);

    function getCategoryData(id: string) {
        const current = categories.find(c => c.id === id);
        setCategoryId(id);
    }

    function getNatureData(id: string) {
        const current = natures.find(n => n.id === id);
        setNatureId(id);
    }
    async function submit(receiptData: ReceiptSchemaType) {
        const { success, data } = receiptSchema.safeParse(receiptData);
        if (!success) return;
        mutateCreateReceipt(
            { ...data },
            {
                onSuccess() {
                    form.reset();
                    refreshData();
                    closeModal();
                },
            }
        );
    }

    return (
        <ScrollArea className="max-h-137.5 pr-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
                    <div className="space-y-4.5 max-w-full">
                        <div className="gap-4.5 grid grid-cols-2">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <DatePicker
                                                value={field.value ?? ""}
                                                label="Date"
                                                mode="single"
                                                onChange={(e) => field.onChange(e as Date)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                isLoading={isGettingCategories}
                                                datas={categories.map(category => ({
                                                    id: category.id,
                                                    label: category.name,
                                                    value: category.id
                                                }))}
                                                value={field.value}
                                                setValue={(e) => {
                                                    getCategoryData(String(e))
                                                    field.onChange(e)
                                                }}
                                                placeholder="Catégorie"
                                                searchMessage="Rechercher une catégorie"
                                                noResultsMessage="Aucune catégorie trouvée."
                                                addElement={<CategoryModal type="dibursement" />}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="gap-4.5 grid grid-cols-2">
                            <FormField
                                control={form.control}
                                name="nature"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                disabled={!categoryId}
                                                isLoading={isGettingNatures}
                                                datas={natures.map(nature => ({
                                                    id: nature.id,
                                                    label: nature.name,
                                                    value: nature.id
                                                }))}
                                                value={field.value}
                                                setValue={(e) => {
                                                    getNatureData(String(e))
                                                    field.onChange(e)
                                                }}
                                                placeholder="Nature"
                                                searchMessage="Rechercher une nature"
                                                noResultsMessage="Aucune nature trouvée."
                                                addElement={<NatureModal categoryId={categoryId} />}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="userAction"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                isLoading={isGettingUserActions}
                                                disabled={!natureId}
                                                datas={userActions.map(userAction => ({
                                                    id: userAction.id,
                                                    label: `${userAction.type === "CLIENT" ? `${userAction?.client?.lastname} ${userAction?.client?.firstname}` : `${userAction?.supplier?.lastname} ${userAction?.supplier?.firstname}`}`,
                                                    value: userAction.id
                                                }))}
                                                value={field.value as string}
                                                setValue={(e) => {
                                                    field.onChange(e)
                                                }}
                                                placeholder="Fournisseur / Tiers"
                                                searchMessage="Rechercher un fournisseur ou un tiers"
                                                noResultsMessage="Aucun fournisseur ou tiers trouvé."
                                                addElement={<UserActionModal natureId={natureId} type="CLIENT" />}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="gap-4.5 grid grid-cols-2">
                            <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                datas={acceptPayment}
                                                value={field.value}
                                                setValue={e => {
                                                    setPaymentMode(e as "check" | "cash" | "bank-transfer");
                                                    field.onChange(e);
                                                }}
                                                placeholder="Mode de paiement"
                                                searchMessage="Rechercher un mode de paiement"
                                                noResultsMessage="Aucun mode de paiement trouvé."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="source"
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
                                                setValue={field.onChange}
                                                placeholder="Source"
                                                searchMessage="Rechercher une source"
                                                noResultsMessage="Aucune source trouvée."
                                                addElement={<SourceModal sourceType={paymentMode} />}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="gap-4.5 grid grid-cols-2">
                            <FormField
                                control={form.control}
                                name="project"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                required={false}
                                                isLoading={isGettingProjects}
                                                datas={projects.map(project => ({
                                                    id: project.id,
                                                    label: `${cutText(project.client.firstname + " " + project.client.lastname)} - ${project.name}`,
                                                    value: project.id
                                                }))}
                                                value={field.value || ""}
                                                setValue={e => {
                                                    field.onChange(e)
                                                }}
                                                placeholder="Projet"
                                                searchMessage="Rechercher un projet"
                                                noResultsMessage="Aucun projet trouvé."
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
                                                    min={0}
                                                    max={maxAmount}
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

                                <FormField
                                    control={form.control}
                                    name="amountType"
                                    render={({ field }) => (
                                        <FormItem className="-space-y-2">
                                            <FormControl>
                                                <RadioGroup
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                    className="flex -space-x-2"
                                                >
                                                    {(
                                                        currentAmountType === undefined ||
                                                        currentAmountType === "HT"
                                                    ) && (
                                                            <div className="flex items-center max-h-11 space-x-2">
                                                                <RadioGroupItem value="HT" id="HT" className="hidden" />
                                                                <Label
                                                                    htmlFor="HT"
                                                                    className={cn(
                                                                        "flex bg-gray px-3 py-1 rounded-md h-full",
                                                                        field.value === "HT" && "bg-blue text-white"
                                                                    )}
                                                                >
                                                                    HT
                                                                </Label>
                                                            </div>
                                                        )}

                                                    {(
                                                        (currentAmountType === undefined ||
                                                            currentAmountType === "TTC")
                                                    ) && (
                                                            <div className="flex items-center max-h-11 space-x-2">
                                                                <RadioGroupItem value="TTC" id="TTC" className="hidden" />
                                                                <Label
                                                                    htmlFor="TTC"
                                                                    className={cn(
                                                                        "flex bg-gray px-3 py-1 rounded-md h-full",
                                                                        field.value === "TTC" && "bg-blue text-white"
                                                                    )}
                                                                >
                                                                    TTC
                                                                </Label>
                                                            </div>
                                                        )}
                                                </RadioGroup>

                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="gap-4.5 grid grid-cols-2">
                            <FormField
                                control={form.control}
                                name="checkNumber"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <TextInput
                                                required={false}
                                                height="h-11"
                                                type="text"
                                                design="float"
                                                label="Numéro de chèque"
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
                                name="documentRef"
                                render={({ field }) => (
                                    <FormItem className="-space-y-2">
                                        <FormControl>
                                            <Combobox
                                                required={false}
                                                isLoading={isGettingDocuments}
                                                datas={documents.map(document => ({
                                                    id: document.id,
                                                    label: `${document.reference}`,
                                                    more: {
                                                        type: document.type,
                                                        price: `${formatNumber(document.price)} ${document.currency}`
                                                    },
                                                    value: document.id
                                                }))}
                                                value={field.value as string}
                                                setValue={e => {
                                                    const doc = documents.find(d => d.id === e);
                                                    setCurrentAmountType(doc?.amountType);
                                                    if (doc) {
                                                        setMaxAmount(Number(doc.payee));
                                                        form.setValue("amountType", doc.amountType);
                                                    } else {
                                                        setMaxAmount(undefined)
                                                    }
                                                    field.onChange(e)
                                                }}
                                                placeholder="Référence du document"
                                                searchMessage="Rechercher une référence"
                                                noResultsMessage="Aucune référence trouvée."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                            required={true}
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
                            {isCreatingReceipt ? <Spinner /> : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </Form>
        </ScrollArea>
    );
}
