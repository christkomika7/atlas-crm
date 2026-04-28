import { useRef, useState } from "react"
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

export default function ImportButton({ refreshBillboard }: ImportButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const companyId = useDataStore.use.currentCompany();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        inputRef.current?.click()
    }

    const { mutate: mutate, isPending } =
        useQueryAction<
            {
                data: BillboardImportType[]
                companyId: string;
            },
            {}
        >(importBillboard, () => { }, "billboards");

    function toBoolean(value: string): boolean {
        if (value.toLowerCase() === "oui") return true
        if (value.toLowerCase() === "non") return false
        return false
    }

    function toNumeric(value: string): string {
        return cleanExcelValue(value).replaceAll(",", "")
    }

    function parseBillboardRow(row: any): BillboardImportType {
        return {
            "Référence": cleanExcelValue(row["Référence"]),
            "Article taxable": toBoolean(cleanExcelValue(row["Article taxable"])),

            "Type de panneau publicitaire": cleanExcelValue(row["Type de panneau publicitaire"]),
            "Nom du panneau publicitaire": cleanExcelValue(row["Nom du panneau publicitaire"]),
            "Lieu": cleanExcelValue(row["Lieu"]),
            "Ville (Panneau)": cleanExcelValue(row["Ville (Panneau)"]),
            "Quartier": cleanExcelValue(row["Quartier"]),
            "Repère visuel": cleanExcelValue(row["Repère visuel"]),
            "Support d'affichage": cleanExcelValue(row["Support d'affichage"]),
            "Orientation": cleanExcelValue(row["Orientation"]),
            "Lien Google Maps": cleanExcelValue(row["Lien Google Maps"]),

            "Prix de location": toNumeric(row["Prix de location"]),
            "Coût d'installation": toNumeric(row["Coût d'installation"]),
            "Coût d'entretien": toNumeric(row["Coût d'entretien"]),

            "Largeur": toNumeric(row["Largeur"]),
            "Hauteur": toNumeric(row["Hauteur"]),
            "Surface": toNumeric(row["Surface"]),

            "Éclairage": cleanExcelValue(row["Éclairage"]),
            "Type de structure": cleanExcelValue(row["Type de structure"]),
            "État du panneau": cleanExcelValue(row["État du panneau"]),

            "Éléments décoratifs": cleanExcelValue(row["Éléments décoratifs"]),
            "Fondations et visserie": cleanExcelValue(row["Fondations et visserie"]),
            "Électricité et éclairage": cleanExcelValue(row["Électricité et éclairage"]),
            "Structure et châssis": cleanExcelValue(row["Structure et châssis"]),
            "Aspect général": cleanExcelValue(row["Aspect général"]),

            "Type d'espace": cleanExcelValue(row["Type d'espace"]),
            "Type de bailleur": cleanExcelValue(row["Type de bailleur"]),

            "Prix du panneau loué": toNumeric(row["Prix du panneau loué"]),
            "Prix du panneau non loué": toNumeric(row["Prix du panneau non loué"]),

            "Nom du bailleur": cleanExcelValue(row["Nom du bailleur"]),
            "Adresse complète du bailleur": cleanExcelValue(row["Adresse complète du bailleur"]),
            "Ville (Bailleur)": cleanExcelValue(row["Ville (Bailleur)"]),
            "Téléphone": cleanExcelValue(row["Téléphone"]),
            "Email": cleanExcelValue(row["Email"]),

            "Nom de la banque": cleanExcelValue(row["Nom de la banque"]),
            "RIB": cleanExcelValue(row["RIB"]),
            "IBAN": cleanExcelValue(row["IBAN"]),
            "BIC/SWIFT": cleanExcelValue(row["BIC/SWIFT"]),

            "Date début location": cleanExcelValue(row["Date début location"]),
            "Durée du contrat": cleanExcelValue(row["Durée du contrat"]),
            "Mode de paiement": cleanExcelValue(row["Mode de paiement"]),
            "Fréquence de paiement": cleanExcelValue(row["Fréquence de paiement"]),
            "Fourniture du courant": cleanExcelValue(row["Fourniture du courant"]),
            "Conditions particulières": cleanExcelValue(row["Conditions particulières"])
        }
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true)
        const file = e.target.files?.[0]

        if (!file) {
            setIsLoading(false)
            return
        }

        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ]

        if (!allowedTypes.includes(file.type)) {
            toast.error("Seuls les fichiers Excel sont autorisés");
            setIsLoading(false)
            return
        }


        const data = await file.arrayBuffer()

        const workbook = XLSX.read(data)

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const raw = XLSX.utils.sheet_to_json(sheet, {
            raw: false,
        })


        const json: BillboardImportType[] = raw.map((row) =>
            parseBillboardRow(row)
        );


        return console.log({ json })


        mutate({ data: json, companyId }, {
            onSuccess() {
                if (inputRef.current) {
                    inputRef.current.value = ""
                }
                refreshBillboard()
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