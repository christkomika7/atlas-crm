import ModalContainer from "@/components/modal/modal-container";
import TextInput from "@/components/ui/text-input";
import { EditIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import AddTaxForm from "./add-tax-form";
import EditTaxForm from "./edit-tax-form";
import useTaxStore from "@/stores/tax.store";


export default function TaxPanel() {
  const taxs = useTaxStore.use.taxs();
  const currentTax = useTaxStore.use.currentTax();
  const deleteTax = useTaxStore.use.deleteTax()
  const setCurrentId = useTaxStore.use.setCurrentId();
  const currentId = useTaxStore.use.id();
  const [open, setOpen] = useState<{ add: boolean, edit: boolean }>({ add: false, edit: false });

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
                  setCurrentId(tax.id);
                  setOpen({ ...open, edit: true });
                }}
              >
                <EditIcon className="size-3.5" />
              </button>
              <button
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteTax(tax.id);
                }}
              >
                <XIcon className="size-3.5 text-red" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ModalContainer
        open={open.edit}
        setOpen={(e) => setOpen({ ...open, edit: Boolean(e) })}
        title="Modifier la taxe"
      >
        {currentTax && (
          <EditTaxForm
            close={() => setOpen({ ...open, edit: false })}
            tax={currentTax}
          />
        )}
      </ModalContainer>

      <ModalContainer
        open={open.add}
        setOpen={(e) => setOpen({ ...open, add: Boolean(e) })}
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
        <AddTaxForm
          close={() => setOpen({ ...open, add: false })} />
      </ModalContainer>
    </div>
  );
}
