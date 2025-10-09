import TextInput from "@/components/ui/text-input";

type QuotesTabProps = {
  prefix: string;
  setPrefix: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function PurchaseOrderTab({
  prefix,
  setPrefix,
  notes,
  setNotes,
}: QuotesTabProps) {
  return (
    <div className="p-2">
      <h2 className="mb-4 font-semibold text-sm">Texte du pied de page</h2>
      <div className="space-y-4">
        <TextInput
          label="Préfixe de numérotation"
          design="float"
          value={prefix}
          required={false}
          handleChange={(e) => setPrefix(e as string)}
        />
        <TextInput
          label="Notes"
          design="text-area"
          value={notes}
          required={false}
          handleChange={(e) => setNotes(e as string)}
          className="h-[120px]"
        />
      </div>
    </div>
  );
}
