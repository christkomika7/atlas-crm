import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import useQueryAction from "@/hook/useQueryAction"
import { useDataStore } from "@/stores/data.store"
import Spinner from "@/components/ui/spinner"
import { cleanExcelValue } from "@/lib/utils"
import { BillboardImportType } from "@/types/billboard.types"
import { importBillboard } from "@/action/billboard.action"
import { toast } from "sonner"

type ImportButtonProps = {
    refreshBillboard: () => void;
}

const toBoolean = (value: string): boolean =>
    value?.toLowerCase() === "oui"

const toNumeric = (value: string): string =>
    cleanExcelValue(value).replaceAll(",", "")

const FIELD_MAP: Record<keyof BillboardImportType, { parse: (v: string) => any }> = {
    "Référence": { parse: cleanExcelValue },
    "Article taxable": { parse: toBoolean },
    "Type de panneau publicitaire": { parse: cleanExcelValue },
    "Nom du panneau publicitaire": { parse: cleanExcelValue },
    "Lieu": { parse: cleanExcelValue },
    "Ville (Panneau)": { parse: cleanExcelValue },
    "Quartier": { parse: cleanExcelValue },
    "Repère visuel": { parse: cleanExcelValue },
    "Support d'affichage": { parse: cleanExcelValue },
    "Orientation": { parse: cleanExcelValue },
    "Lien Google Maps": { parse: cleanExcelValue },
    "Prix de location": { parse: toNumeric },
    "Coût d'installation": { parse: toNumeric },
    "Coût d'entretien": { parse: toNumeric },
    "Largeur": { parse: toNumeric },
    "Hauteur": { parse: toNumeric },
    "Surface": { parse: toNumeric },
    "Éclairage": { parse: cleanExcelValue },
    "Type de structure": { parse: cleanExcelValue },
    "État du panneau": { parse: cleanExcelValue },
    "Éléments décoratifs": { parse: cleanExcelValue },
    "Fondations et visserie": { parse: cleanExcelValue },
    "Électricité et éclairage": { parse: cleanExcelValue },
    "Structure et châssis": { parse: cleanExcelValue },
    "Aspect général": { parse: cleanExcelValue },
    "Type d'espace": { parse: cleanExcelValue },
    "Type de bailleur": { parse: cleanExcelValue },
    "Prix du panneau loué": { parse: toNumeric },
    "Prix du panneau non loué": { parse: toNumeric },
    "Nom du bailleur": { parse: cleanExcelValue },
    "Adresse complète du bailleur": { parse: cleanExcelValue },
    "Ville (Bailleur)": { parse: cleanExcelValue },
    "Téléphone": { parse: cleanExcelValue },
    "Email": { parse: cleanExcelValue },
    "Nom de la banque": { parse: cleanExcelValue },
    "RIB": { parse: cleanExcelValue },
    "IBAN": { parse: cleanExcelValue },
    "BIC/SWIFT": { parse: cleanExcelValue },
    "Date début location": { parse: cleanExcelValue },
    "Durée du contrat": { parse: cleanExcelValue },
    "Mode de paiement": { parse: cleanExcelValue },
    "Fréquence de paiement": { parse: cleanExcelValue },
    "Fourniture du courant": { parse: cleanExcelValue },
    "Conditions particulières": { parse: cleanExcelValue },
}

const parseBillboardRow = (row: any): BillboardImportType =>
    Object.fromEntries(
        Object.entries(FIELD_MAP).map(([key, { parse }]) => [key, parse(row[key] ?? "")])
    ) as BillboardImportType

const parseRowsAsync = (
    rows: any[],
    chunkSize = 200
): Promise<BillboardImportType[]> =>
    new Promise((resolve) => {
        const result: BillboardImportType[] = []
        let index = 0

        const processChunk = () => {
            const end = Math.min(index + chunkSize, rows.length)
            for (; index < end; index++) {
                result.push(parseBillboardRow(rows[index]))
            }
            if (index < rows.length) {
                setTimeout(processChunk, 0)
            } else {
                resolve(result)
            }
        }

        processChunk()
    })

const ALLOWED_TYPES = new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
])


export default function ImportButton({ refreshBillboard }: ImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const companyId = useDataStore.use.currentCompany()
    const [isLoading, setIsLoading] = useState(false)

    const { mutate, isPending } = useQueryAction<
        { data: BillboardImportType[]; companyId: string },
        {}
    >(importBillboard, () => { }, "billboards")

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

            // dense: true → tableau indexé, plus rapide que les objets nommés
            const workbook = XLSX.read(buffer, { dense: true })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]

            const raw = XLSX.utils.sheet_to_json(sheet, { raw: false })

            // Parsing asynchrone par chunks → ne bloque pas l'UI
            const data = await parseRowsAsync(raw)

            mutate({ data, companyId }, {
                onSuccess() {
                    resetInput()
                    refreshBillboard()
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
    }, [companyId, mutate, refreshBillboard])

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