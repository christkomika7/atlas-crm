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
import {
    dibursementSchema,
    DibursementSchemaType,
} from "@/lib/zod/dibursement.schema";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn, cutText, formatNumber } from "@/lib/utils";
import useTransactionStore from "@/stores/transaction.store";
import { FiscalObjectType, SourceType, TransactionCategoryType, TransactionDocument, TransactionNatureType, TransactionType, UserActionType } from "@/types/transaction.type";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { getCategories, getDocuments, getFisclaObjects, getNatures, getSources, getUserActionsByNature, updateDibursement } from "@/action/transaction.action";
import CategoryModal from "../../../../components/modal/category-modal";
import NatureModal from "../../../../components/modal/nature-modal";
import { acceptPayment } from "@/lib/data";
import SourceModal from "../../../../components/modal/source-modal";
import { ProjectType } from "@/types/project.types";
import { getallByCompany } from "@/action/project.action";
import { ADMINISTRATION_CATEGORY, FISCAL_NATURE, FISCAL_OBJECT } from "@/config/constant";
import FiscalObjectModal from "@/components/modal/fiscal-object-modal";
import { $Enums } from "@/lib/generated/prisma";
import UserActionModal from "../../../../components/modal/user-action-modal";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";

type DibursementFormProps = {
    transaction?: TransactionType;
};

export default function EditDibursementForm({ transaction }: DibursementFormProps) {
    const router = useRouter();
    const companyId = useDataStore.use.currentCompany();

    const fiscalObjects = useTransactionStore.use.fiscalObjects();
    const setFiscalObjects = useTransactionStore.use.setFiscalObjects();
    const categories = useTransactionStore.use.categories();
    const setCategories = useTransactionStore.use.setCategories();
    const natures = useTransactionStore.use.natures();
    const setNatures = useTransactionStore.use.setNatures();
    const sources = useTransactionStore.use.sources();
    const setSources = useTransactionStore.use.setSources();
    const userActions = useTransactionStore.use.userActions();
    const setUserActions = useTransactionStore.use.setUserActions();

    const [categoryId, setCategoryId] = useState(transaction?.categoryId || "");
    const [documents, setDocuments] = useState<TransactionDocument[]>([]);
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [category, setCategory] = useState(transaction?.category?.name || "");
    const [paymentMode, setPaymentMode] = useState<"cash" | "check" | "bank-transfer" | undefined>(transaction?.paymentType as unknown as "cash" | "check" | "bank-transfer" | undefined);
    const [natureId, setNatureId] = useState(transaction?.natureId || "");
    const [nature, setNature] = useState(transaction?.nature?.name || "");
    const [fiscalObject, setFiscalObject] = useState("");
    const [currentAmountType, setCurrentAmountType] = useState<$Enums.AmountType | undefined>(transaction?.amountType);
    const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [pendingData, setPendingData] = useState<DibursementSchemaType | null>(null);

    const form = useForm<DibursementSchemaType>({
        resolver: zodResolver(dibursementSchema)
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
        mutate: mutateGetFiscalObjects,
        isPending: isGettingFiscalObjects,
    } = useQueryAction<{ companyId: string }, RequestResponse<FiscalObjectType[]>>(
        getFisclaObjects,
        () => { },
        "fiscal-objects"
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

    const { mutate: mutateUpdateDibursement, isPending: isUpdatingDibursement } = useQueryAction<
        DibursementSchemaType & { id: string },
        RequestResponse<TransactionType>
    >(updateDibursement, () => { }, "dibursement");

    useEffect(() => {
        if (!transaction) return

        form.setValue("companyId", transaction.companyId || companyId || "");
        form.setValue("category", transaction.category.id || "");
        form.setValue("nature", transaction.nature.id || "");
        form.setValue("userAction", transaction.userActionId || "");
        form.setValue("fiscalObject", transaction.fiscalObjectId || "");
        form.setValue("project", transaction.projectId || "");
        form.setValue("date", new Date(transaction.date));
        form.setValue("paymentMode", transaction.paymentType || "");
        form.setValue("source", transaction.sourceId || "");
        form.setValue("period", transaction.period || "");
        form.setValue("amount", Number(transaction.amount) || 0);
        form.setValue("amountType", transaction.amountType || "HT");
        form.setValue("checkNumber", transaction.checkNumber || "");
        form.setValue("information", transaction.infos || "");

        mutateGetCategories({ companyId, type: "dibursement" }, {
            onSuccess(data) {
                if (data.data) {
                    setCategories(data.data);
                    form.setValue("category", transaction.category.id || "");
                    setCategoryId(transaction.category.id);
                    setCategory(transaction.category.name);
                }
            },
        });

        mutateGetNature(
            { categoryId: transaction.category.id },
            {
                onSuccess: (data) => {
                    if (data.data) {
                        setNatures(data.data);
                        form.setValue("nature", transaction.nature.id || "");
                        setNatureId(transaction.nature.id);
                        setNature(transaction.nature.name);
                    }
                },
            }
        );


        mutateGetUserActions(
            { natureId: transaction.nature.id },
            {
                onSuccess: (data) => {
                    if (data.data) {
                        setUserActions(data.data);
                        form.setValue("userAction", transaction.userActionId || "");
                    }
                },
            }
        );

        mutateGetSources({ companyId, type: paymentMode }, {
            onSuccess(data) {
                if (data.data) {
                    setSources(data.data)
                    form.setValue("source", transaction.sourceId || "");
                };
            },
        });

        mutateGetProjects({ companyId, projectStatus: "loading" }, {
            onSuccess(data) {
                if (data.data) setProjects(data.data);
                form.setValue("project", transaction.projectId || "");
            },
        });

        mutateGetFiscalObjects({ companyId }, {
            onSuccess(data) {
                if (data.data) {
                    setFiscalObjects(data.data);
                    if (transaction.fiscalObjectId) {
                        form.setValue("fiscalObject", transaction.fiscalObjectId);
                    }
                }
            }
        });

        mutateGetDocuments({ companyId, type: "dibursement" }, {
            onSuccess(data) {
                if (data.data) {
                    setDocuments(data.data);
                    if (transaction.referencePurchaseOrderId || transaction.referencePurchaseOrder?.id) {
                        const documentId = transaction.referencePurchaseOrderId || transaction.referencePurchaseOrder?.id || "";
                        form.setValue("documentRef", documentId);

                    }
                }
            },
        });

    }, [transaction]);



    useEffect(() => {
        if (!categoryId) return;
        mutateGetNature(
            { categoryId },
            {
                onSuccess: (data) => {
                    if (data.data) {
                        setNatures(data.data);
                    }
                },
            }
        );
    }, [categoryId]);

    useEffect(() => {
        if (!companyId) return;
        mutateGetSources(
            { companyId, type: paymentMode },
            {
                onSuccess: (data) => {
                    if (data.data) {
                        setSources(data.data);
                        if (paymentMode !== transaction?.paymentType) {
                            form.setValue("source", "");
                        }
                    }
                },
            }
        );
    }, [paymentMode, companyId]);

    useEffect(() => {
        if (!natureId) return;
        mutateGetUserActions(
            { natureId },
            {
                onSuccess: (data) => {
                    if (data.data) {
                        setUserActions(data.data);
                    }
                },
            }
        );
    }, [natureId]);


    function getCategoryData(id: string) {
        const current = categories.find(c => c.id === id);
        setCategory(current?.name || "");
        setCategoryId(id);
    }

    function getNatureData(id: string) {
        const current = natures.find(n => n.id === id);
        setNature(current?.name || "");
        setNatureId(id);
    }

    function getFiscalObjectName(id: string) {
        const current = fiscalObjects.find(f => f.id === id);
        setFiscalObject(current?.name || "");
    }

    async function submit(dibursementData: DibursementSchemaType) {
        const { success, data } = dibursementSchema.safeParse(dibursementData);
        if (!success) return;

        if (!dibursementData.period) {
            setPendingData(data);
            setOpenConfirm(true);
            return;
        }

        if (transaction?.id) {
            mutateUpdateDibursement(
                { ...data, id: transaction.id },
                {
                    onSuccess() {
                        form.reset();
                        setOpenConfirm(false);
                        setPendingData(null);
                        router.push(`/transaction`);
                    },
                }
            );
        }
    }

    function confirmSubmit() {
        if (!pendingData || !transaction?.id) return;

        mutateUpdateDibursement(
            { ...pendingData, id: transaction.id },
            {
                onSuccess() {
                    form.reset();
                    setOpenConfirm(false);
                    setPendingData(null);
                    router.push(`/transaction`);
                },
            }
        );
    }

    return (
        <>
            {isGettingCategories && isGettingNatures && isGettingSources && isGettingUserActions && isGettingDocuments && isGettingProjects ? (
                <div className="flex flex-col gap-3 items-center justify-center h-48">
                    Chargement des données du formulaire... <Spinner />
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(submit)}
                            className="space-y-4.5 m-2">
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
                                                            label: userAction.name,
                                                            value: userAction.id
                                                        }))}
                                                        value={field.value as string}
                                                        setValue={(e) => {
                                                            field.onChange(e)
                                                        }}
                                                        placeholder="Fournisseur / Tiers"
                                                        searchMessage="Rechercher un fournisseur ou un tiers"
                                                        noResultsMessage="Aucun fournisseur ou tiers trouvé."
                                                        addElement={<UserActionModal natureId={natureId} type="SUPPLIER" />}
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
                                    {ADMINISTRATION_CATEGORY === category && FISCAL_NATURE === nature ?
                                        <FormField
                                            control={form.control}
                                            name="fiscalObject"
                                            render={({ field }) => (
                                                <FormItem className="-space-y-2">
                                                    <FormControl>
                                                        <Combobox
                                                            required={true}
                                                            isLoading={isGettingFiscalObjects}
                                                            datas={fiscalObjects.map(fiscalObject => ({
                                                                id: fiscalObject.id,
                                                                label: `${cutText(fiscalObject.name)}`,
                                                                value: fiscalObject.id
                                                            }))}
                                                            value={field.value || ""}
                                                            setValue={e => {
                                                                field.onChange(e)
                                                                getFiscalObjectName(String(e))
                                                            }}
                                                            placeholder="Objet du paiement"
                                                            searchMessage="Rechercher un objet de paiement"
                                                            noResultsMessage="Aucun objet trouvé trouvé."
                                                            addElement={<FiscalObjectModal />}

                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        /> :
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
                                    }

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
                                                            className="flex -space-x-2"
                                                        >
                                                            {
                                                                FISCAL_OBJECT === fiscalObject
                                                                && (
                                                                    <div className="flex items-center max-h-11 space-x-2">
                                                                        <RadioGroupItem value="HT" id="HT" className="hidden" />
                                                                        <Label
                                                                            htmlFor="HT"
                                                                            onClick={() => {
                                                                                setCurrentAmountType("HT");
                                                                                field.onChange("HT");
                                                                            }}
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
                                                                FISCAL_OBJECT !== fiscalObject
                                                            ) && (
                                                                    <div className="flex items-center max-h-11 space-x-2">
                                                                        <RadioGroupItem value="TTC" id="TTC" className="hidden" />
                                                                        <Label
                                                                            htmlFor="TTC"
                                                                            onClick={() => {
                                                                                setCurrentAmountType("TTC");
                                                                                field.onChange("TTC");
                                                                            }}
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
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem className="-space-y-2">
                                            <FormControl>
                                                <TextInput
                                                    required={false}
                                                    height="h-11"
                                                    type="text"
                                                    design="float"
                                                    label="Période"
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
                                    {(pendingData?.period || isUpdatingDibursement) ? <Spinner /> : "Mettre à jour"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Confirmation
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir enregistrer sans avoir saisie la période ?
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation()
                                    confirmSubmit();
                                }}>
                                    {isUpdatingDibursement ? <Spinner /> : "Valider"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )
            }
        </>
    );
}
