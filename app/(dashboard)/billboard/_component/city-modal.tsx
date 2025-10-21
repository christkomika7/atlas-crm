import { create, remove } from "@/action/city.action";
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
import { CitySchemaType } from "@/lib/zod/city.schema";
import useCityStore from "@/stores/city.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { CityType } from "@/types/city.types";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CityModal() {
  const companyId = useDataStore.use.currentCompany();
  const cities = useCityStore.use.cities();
  const addCity = useCityStore.use.addCity();
  const removeCity = useCityStore.use.removeCity();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState("");

  const { mutate, isPending } = useQueryAction<
    CitySchemaType,
    RequestResponse<CityType>
  >(create, () => { }, "cities");

  const { mutate: mutateRemoveCity, isPending: isPendingRetrieveCity } =
    useQueryAction<{ id: string }, RequestResponse<CityType>>(
      remove,
      () => { },
      "cities"
    );

  function retrieveCity(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    id: string
  ) {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return toast.error("Aucun identifiant trouvé.");
    setCurrentId(id);

    mutateRemoveCity(
      { id },
      {
        onSuccess(data) {
          if (data.data) {
            removeCity(data.data.id);
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
    if (!name) return toast.error("Aucun élélement inséré.");
    mutate(
      { name, companyId },
      {
        onSuccess(data) {
          if (data.data) {
            addCity(data.data);
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
          <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Ville
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter une ville</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="">
          <ScrollArea className="h-[200px]">
            <ul>
              {cities.length === 0 ? (
                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                  Aucune ville trouvée.
                </li>
              ) : (
                cities.map((city) => (
                  <li
                    key={city.id}
                    className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                  >
                    {city.name}{" "}
                    <div className="flex items-center gap-x-2">
                      <span
                        onClick={(e) => retrieveCity(e, city.id)}
                        className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                      >
                        <XIcon className="w-[13px] h-[13px]" />
                      </span>{" "}
                      {currentId === city.id && isPendingRetrieveCity && (
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
              label="Ville"
              value={name}
              handleChange={(e) => setName(e as string)}
            />
            <Button
              onClick={submit}
              variant="primary"
              disabled={isPending || isPendingRetrieveCity}
            >
              {isPending ? <Spinner /> : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
