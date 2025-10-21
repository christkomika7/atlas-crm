import ModalContainer from "@/components/modal/modal-container";
import TextInput from "@/components/ui/text-input";
import { EditIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import AddTaxForm from "./add-tax-form";
import EditTaxForm from "./edit-tax-form";
import { TaxSchemaType } from "@/lib/zod/company.schema";

type TaxPanelProps = {
  taxs: TaxSchemaType[];
  setTaxs: (taxs: TaxSchemaType[]) => void;
};

export default function TaxPanel({ taxs, setTaxs }: TaxPanelProps) {
  const [selectedTaxIndex, setSelectedTaxIndex] = useState<number | null>(null);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [openAdd, setOpenAdd] = useState<boolean>(false);

  const handleEdit = (index: number) => {
    setSelectedTaxIndex(index);
    setOpenEdit(true);
  };

  const handleDelete = (index: number) => {
    setTaxs(taxs.filter((_, i) => i !== index));
  };

  const selectedTax = selectedTaxIndex !== null ? taxs[selectedTaxIndex] : null;

  return (
    <div className="space-y-1">
      <div className="space-y-4.5">
        {taxs.map((tax, index) => (
          <div
            key={index}
            className="items-center gap-x-4 grid grid-cols-[1fr_32px]"
          >
            <TextInput
              design="float"
              label={tax.taxName}
              value={tax.taxValue}
              disabled
              handleChange={() => { }}
            />
            <div className="flex items-center gap-x-1 w-fit">
              <button
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEdit(index);
                }}
              >
                <EditIcon className="size-3.5" />
              </button>
              <button
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <XIcon className="size-3.5 text-red" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ModalContainer
        open={openEdit}
        setOpen={setOpenEdit}
        title="Modifier la taxe"
      >
        {selectedTax !== null && selectedTaxIndex !== null && (
          <EditTaxForm
            setOpen={setOpenEdit}
            tax={selectedTax}
            taxs={taxs}
            setTaxs={setTaxs}
            index={selectedTaxIndex}
          />
        )}
      </ModalContainer>

      <ModalContainer
        open={openAdd}
        setOpen={setOpenAdd}
        title="Ajouter une nouvelle taxe"
        action={
          <button
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-blue text-sm cursor-pointer"
          >
            Ajouter une taxe
          </button>
        }
      >
        <AddTaxForm setOpen={setOpenAdd} taxs={taxs} setTaxs={setTaxs} />
      </ModalContainer>
    </div>
  );
}
