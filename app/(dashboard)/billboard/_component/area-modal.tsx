import { create, remove } from "@/action/area.action";
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
import { AreaSchemaType } from "@/lib/zod/area.schema";
import useAreaStore from "@/stores/area.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { AreaType } from "@/types/area.types";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AreaModalProps = {
  cityId: string;
};

export default function AreaModal({ cityId }: AreaModalProps) {
  const companyId = useDataStore.use.currentCompany();
  const areas = useAreaStore.use.areas();
  const addArea = useAreaStore.use.addArea();
  const removeArea = useAreaStore.use.removeArea();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState("");
  const { mutate, isPending } = useQueryAction<
    AreaSchemaType,
    RequestResponse<AreaType>
  >(create, () => { }, "areas");

  const { mutate: mutateRemoveArea, isPending: isPendingRetrieveArea } =
    useQueryAction<{ id: string }, RequestResponse<AreaType>>(
      remove,
      () => { },
      "areas"
    );

  function retrieveArea(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    id: string
  ) {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return toast.error("Aucun identifiant trouvé.");
    setCurrentId(id);
    mutateRemoveArea(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            removeArea(data.data.id);
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
    if (!cityId)
      return toast.error(
        "Séléctionner une ville avant d'ajouter un emplacement."
      );
    if (!name) return toast.error("Aucun élément inséré.");
    mutate(
      { name, companyId, cityId },
      {
        onSuccess(data) {
          if (data.data) {
            addArea(data.data);
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
          <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Quartier
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter un quartier</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="">
          <ScrollArea className="h-[200px]">
            <ul>
              {areas.length === 0 ? (
                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                  Aucun quartier trouvé.
                </li>
              ) : (
                areas.map((area) => (
                  <li
                    key={area.id}
                    className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                  >
                    {area.name}{" "}
                    <div className="flex items-center gap-x-2">
                      <span
                        onClick={(e) => retrieveArea(e, area.id)}
                        className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                      >
                        <XIcon className="w-[13px] h-[13px]" />
                      </span>{" "}
                      {currentId === area.id && isPendingRetrieveArea && (
                        <Spinner size={10} />
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
          <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
            <TextInput
              design="float"
              label="Quartier"
              value={name}
              handleChange={(e) => setName(e as string)}
            />
            <Button
              onClick={submit}
              variant="primary"
              disabled={isPending || isPendingRetrieveArea}
            >
              {isPending ? <Spinner /> : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
