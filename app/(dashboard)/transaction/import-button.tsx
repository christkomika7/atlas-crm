import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import useQueryAction from "@/hook/useQueryAction"
import { TransactionImportType } from "@/types/transaction.type"
import { importTransaction } from "@/action/transaction.action"
import { useDataStore } from "@/stores/data.store"
import Spinner from "@/components/ui/spinner"
import { cleanExcelValue } from "@/lib/utils"

type ImportButtonProps = {
    refreshTransaction: () => void;
}

export default function ImportButton({ refreshTransaction }: ImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const companyId = useDataStore.use.currentCompany();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        inputRef.current?.click()
    }

    const { mutate: mutate, isPending } =
        useQueryAction<
            {
                data: TransactionImportType[]
                companyId: string;
            },
            {}
        >(importTransaction, () => { }, "transaction");


    function parseTransactionRow(row: any): TransactionImportType {
        return {
            Date: cleanExcelValue(row["Date"]),
            Mouvement: cleanExcelValue(row["Mouvement"]),
            Catégorie: cleanExcelValue(row["Catégorie"]),
            Nature: cleanExcelValue(row["Nature"]),
            "HT Montant": cleanExcelValue(row["HT Montant"]),
            "TTC Montant": cleanExcelValue(row["TTC Montant"]),
            "Mode de paiement": cleanExcelValue(row["Mode de paiement"]),
            "Numéro de chèque": cleanExcelValue(row["Numéro de chèque"]),
            "Référence du document": cleanExcelValue(row["Référence du document"]),
            Source: cleanExcelValue(row["Source"]),
            Période: cleanExcelValue(row["Période"]),
            "Client | Fournisseur | Tiers": cleanExcelValue(
                row["Client | Fournisseur | Tiers"]
            ),
            Commentaire: cleanExcelValue(row["Commentaire"]),
        };
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true)
        const file = e.target.files?.[0]

        if (!file) return

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ]

        if (!allowedTypes.includes(file.type)) {
            alert("Seuls les fichiers Excel sont autorisés")
            return
        }

        const data = await file.arrayBuffer()

        const workbook = XLSX.read(data)

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const raw: TransactionImportType[] = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
        })


        const json: TransactionImportType[] = raw.map((row) =>
            parseTransactionRow(row)
        );

        mutate({ data: json, companyId }, {
            onSuccess() {
                if (inputRef.current) {
                    inputRef.current.value = ""
                }
                refreshTransaction()
                setIsLoading(false)

            },
            onError() {
                if (inputRef.current) {
                    inputRef.current.value = ""
                }
                setIsLoading(false)
            },
        })
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFile}
            />

            <Button
                variant="inset-primary"
                className="border-emerald-500 text-emerald-500"
                onClick={handleClick}
            >
                {(isPending || isLoading) ? <Spinner size={14} /> : "Importer Excel"}
            </Button>
        </>
    )
}