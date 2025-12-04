import ModalContainer from "@/components/modal/modal-container";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetStateAction, useState } from "react";
import ReceiptForm from "./receipt-form";
import DibursementForm from "./dibursement-form";
import TransferForm from "./transfer-form";

type HeaderMenuProps = {
  refreshTransaction: () => void;
}

export default function HeaderMenu({ refreshTransaction }: HeaderMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState({
    receipt: false,
    dibursement: false,
    transfer: false
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" className="p-0 rounded-lg">
          Transaction
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[220px]">
        <ul className="p-2">
          <li>
            <ModalContainer
              size="xl"
              action={
                <Button
                  variant="primary"
                  className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
                >
                  Ajouter un encaissement
                </Button>
              }
              title="Nouvel encaissement"
              open={open.receipt}
              setOpen={function (value: SetStateAction<boolean>): void {
                setOpen((prev) => ({ ...prev, receipt: value as boolean }));
              }}
            >
              <ReceiptForm
                refreshTransaction={refreshTransaction}
                closeModal={() =>
                  setOpen((prev) => ({ ...prev, receipt: false }))
                }
              />
            </ModalContainer>
          </li>
          <li>
            <ModalContainer
              size="xl"
              action={
                <Button
                  variant="primary"
                  className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
                >
                  Ajouter  un décaissement
                </Button>
              }
              title="Nouveau décaissement"
              open={open.dibursement}
              setOpen={function (value: SetStateAction<boolean>): void {
                setOpen((prev) => ({ ...prev, dibursement: value as boolean }));
              }}
            >
              <DibursementForm
                refreshTransaction={refreshTransaction}
                closeModal={() =>
                  setOpen((prev) => ({ ...prev, dibursement: false }))
                }
              />
            </ModalContainer>
          </li>
          <li>
            <ModalContainer
              size="xl"
              action={
                <Button
                  variant="primary"
                  className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
                >
                  Réaliser un transfert
                </Button>
              }
              title="Transfert CaC"
              open={open.transfer}
              setOpen={function (value: SetStateAction<boolean>): void {
                setOpen((prev) => ({ ...prev, transfer: value as boolean }));
              }}
            >
              <TransferForm
                refreshTransaction={refreshTransaction}
                closeModal={() =>
                  setOpen((prev) => ({ ...prev, transfer: false }))
                }
              />
            </ModalContainer>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
