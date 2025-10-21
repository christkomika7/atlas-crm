import { create, remove } from "@/action/billboard-type.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { BaseSchemaType } from "@/lib/zod/base-type.schema";
import useBillboardTypeStore from "@/stores/billboard-type.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BillboardTypeModal() {
  const companyId = useDataStore.use.currentCompany();
  const billboardsType = useBillboardTypeStore.use.billboardsType();
  const addBillboardType = useBillboardTypeStore.use.addBillboardType();
  const removeBillboardType = useBillboardTypeStore.use.removeBillboardType();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState("");

  const { mutate, isPending } = useQueryAction<
    BaseSchemaType,
    RequestResponse<BaseType>
  >(create, () => { }, "billboardsType");

  const {
    mutate: mutateRemoveBillboardType,
    isPending: isPendingRetrieveBillboardType,
  } = useQueryAction<{ id: string }, RequestResponse<BaseType>>(
    remove,
    () => { },
    "billboardsType"
  );

  function retrieveBillboardType(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    id: string
  ) {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return toast.error("Aucun identifiant trouvé.");
    setCurrentId(id);

    mutateRemoveBillboardType(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            removeBillboardType(data.data.id);
            setName("");
          }
        },
      }
    );
  }

  function submit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();

    if (!companyId) return toast.error("Aucune entreprise trouvée.");
    if (!name) return toast.error("Aucun element inséré.");
    mutate(
      { name, companyId },
      {
        onSuccess(data) {
          if (data.data) {
            addBillboardType(data.data);
            setName("");
          }
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant="primary"
          className="!h-9 font-medium"
        >
          <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Type de panneau
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter un type de panneau</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="">
          <ScrollArea className="h-[200px]">
            <ul>
              {billboardsType.length === 0 ? (
                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                  Aucun type de panneau publicitaire trouvé.
                </li>
              ) : (
                billboardsType.map((billboardType) => (
                  <li
                    key={billboardType.id}
                    className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                  >
                    {billboardType.name}{" "}
                    <div className="flex items-center gap-x-2">
                      <span
                        onClick={(e) =>
                          retrieveBillboardType(e, billboardType.id)
                        }
                        className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                      >
                        <XIcon className="w-[13px] h-[13px]" />
                      </span>{" "}
                      {currentId === billboardType.id &&
                        isPendingRetrieveBillboardType && <Spinner size={10} />}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
          <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
            <TextInput
              design="float"
              label="Type de panneau"
              value={name}
              handleChange={(e) => setName(e as string)}
            />
            <Button
              onClick={submit}
              variant="primary"
              disabled={isPending || isPendingRetrieveBillboardType}
            >
              {isPending ? <Spinner /> : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
