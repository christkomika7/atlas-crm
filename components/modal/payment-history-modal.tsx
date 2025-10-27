import { getPayments, removePayment } from "@/action/payment.action";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { PaymentType } from "@/types/payment.types";
import Spinner from "../ui/spinner";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { cutText, formatNumber } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { XIcon } from "lucide-react";

type PaymentHistoryModalProps = {
    recordId: string;
    recordType: "invoice" | "purchase-order"
    closeModal: () => void;
    title: string;
    amount: string;
    refresh: () => void
}

export default function PaymentHistoryModal({ recordId, recordType, closeModal, title, amount, refresh }: PaymentHistoryModalProps) {
    const [currentId, setCurrentId] = useState<string>("");
    const [payments, setPayments] = useState<PaymentType[]>([]);
    const { mutate: mutateGetPayments, isPending: isGettingPayments } =
        useQueryAction<{
            recordId: string;
            recordName: "invoice" | "purchase-order";
        }, RequestResponse<PaymentType[]>>(
            getPayments,
            () => { },
            "payments",
        );


    const { mutate: mutateRemovePayment, isPending: isRemovingPayment } =
        useQueryAction<{ id: string }, RequestResponse<PaymentType>>(
            removePayment,
            () => { },
            "payment",
        );


    useEffect(() => {
        initPayment()
    }, [recordId, recordType])

    function initPayment() {
        if (recordId && recordType) {
            mutateGetPayments({ recordId, recordName: recordType }, {
                onSuccess(data) {
                    if (data.data) {
                        setPayments(data.data)
                    }
                },
            })
        }
    }


    function deletePayment(id: string) {
        setCurrentId(id);
        if (id) {
            mutateRemovePayment({ id }, {
                onSuccess() {
                    setCurrentId("");
                    initPayment()
                    refresh()
                },
            })
        }

    }


    return (
        <>
            <div className="flex justify-between gap-x-4 p-4 border-b">
                <h2 className="font-medium">{title}</h2>
                <p className="text-sm font-medium"><span className="text-base font-semibold">Solde:</span> {amount}</p>
            </div>
            <ScrollArea className="max-h-[450px]">
                <Table>
                    <TableHeader>
                        <TableRow className="h-14">
                            <TableHead className="font-medium text-center">Date</TableHead>
                            <TableHead className="font-medium text-center">Description</TableHead>
                            <TableHead className="font-medium text-center">Montant</TableHead>
                            <TableHead className="font-medium text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isGettingPayments ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <div className="flex justify-center items-center py-6 w-full">
                                        <Spinner />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : payments.length > 0 ? (
                            payments.map((payment) => (
                                <TableRow
                                    key={payment.id}
                                    className={`h-16 transition-colors`}
                                >
                                    <TableCell className="text-neutral-600 text-center">
                                        {new Date(payment.createdAt).toLocaleDateString("fr-FR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-neutral-600 text-center">
                                        {payment.infos ? cutText(payment.infos, 20) : "-"}
                                    </TableCell>
                                    <TableCell className="text-neutral-600 text-center">
                                        {formatNumber(payment.amount)}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <div className="flex w-full justify-center">
                                            {currentId === payment.id && isRemovingPayment ? <Spinner size={15} /> :
                                                <span className="text-red cursor-pointer" onClick={() => deletePayment(payment.id)}><XIcon size={15} /></span>
                                            }
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="py-6 text-gray-500 text-sm text-center"
                                >
                                    Aucun paiement trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </>

    )
}
