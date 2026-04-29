import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import useQueryAction from "@/hook/useQueryAction"
import { TransactionImportType } from "@/types/transaction.type"
import { importTransaction } from "@/action/transaction.action"
import { useDataStore } from "@/stores/data.store"
import Spinner from "@/components/ui/spinner"
import { cleanExcelValue } from "@/lib/utils"
import { toast } from "sonner"

type ImportButtonProps = {
    refreshTransaction: () => void;
}

const ALLOWED_TYPES = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
])

const TRANSACTION_FIELDS: (keyof TransactionImportType)[] = [
    "Date",
    "Mouvement",
    "Catégorie",
    "Nature",
    "HT Montant",
    "TTC Montant",
    "Mode de paiement",
    "Numéro de chèque",
    "Référence du document",
    "Source",
    "Période",
    "Client | Fournisseur | Tiers",
    "Commentaire",
]

const parseTransactionRow = (row: any): TransactionImportType =>
    Object.fromEntries(
        TRANSACTION_FIELDS.map((key) => [key, cleanExcelValue(row[key] ?? "")])
    ) as TransactionImportType

const parseRowsAsync = (
    rows: any[],
    chunkSize = 200
): Promise<TransactionImportType[]> =>
    new Promise((resolve) => {
        const result: TransactionImportType[] = []
        let index = 0

        const processChunk = () => {
            const end = Math.min(index + chunkSize, rows.length)
            for (; index < end; index++) {
                result.push(parseTransactionRow(rows[index]))
            }
            if (index < rows.length) {
                setTimeout(processChunk, 0)
            } else {
                resolve(result)
            }
        }

        processChunk()
    })


export default function ImportButton({ refreshTransaction }: ImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const companyId = useDataStore.use.currentCompany()
    const [isLoading, setIsLoading] = useState(false)

    const { mutate, isPending } = useQueryAction<
        { data: TransactionImportType[]; companyId: string },
        {}
    >(importTransaction, () => { }, "transaction")

    const resetInput = () => {
        if (inputRef.current) inputRef.current.value = ""
    }

    const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!ALLOWED_TYPES.has(file.type)) {
            toast.error("Seuls les fichiers Excel sont autorisés")
            resetInput()
            return
        }

        setIsLoading(true)

        try {
            const buffer = await file.arrayBuffer()

            const workbook = XLSX.read(buffer, { dense: true })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]
            const raw = XLSX.utils.sheet_to_json(sheet, { raw: false })

            const data = await parseRowsAsync(raw)

            mutate({ data, companyId }, {
                onSuccess() {
                    resetInput()
                    refreshTransaction()
                    setIsLoading(false)
                },
                onError() {
                    resetInput()
                    setIsLoading(false)
                },
            })
        } catch {
            toast.error("Erreur lors de la lecture du fichier")
            resetInput()
            setIsLoading(false)
        }
    }, [companyId, mutate, refreshTransaction])

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
                onClick={() => inputRef.current?.click()}
            >
                {isPending || isLoading ? <Spinner size={14} /> : "Importer Excel"}
            </Button>
        </>
    )
}