import { Combobox } from "@/components/ui/combobox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import { billboardStrucutures, generalNotes } from "@/lib/data";
import {
  billboardError,
  BillboardErrorType,
  EditBillboardSchemaFormType,
} from "@/lib/zod/billboard.schema";
import { RequestResponse } from "@/types/api.types";
import { AreaType } from "@/types/area.types";
import { UseFormReturn } from "react-hook-form";
import useAreaStore from "@/stores/area.store";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { DownloadIcon, XIcon } from "lucide-react";
import { downloadFile } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useCityStore from "@/stores/city.store";
import useQueryAction from "@/hook/useQueryAction";
import { all as allAreas } from "@/action/area.action";
import { all as allCities } from "@/action/city.action";
import { all as allBillboardType } from "@/action/billboard-type.action";
import { CityType } from "@/types/city.types";
import CityModal from "../../../_component/city-modal";
import AreaModal from "../../../_component/area-modal";
import useBillboardTypeStore from "@/stores/billboard-type.store";
import { BillboardTypeType } from "@/types/billboard-type.types";
import BillboardTypeModal from "../../../_component/billboard-type-modal";
import { Decimal } from "decimal.js";
import { Switch } from "@/components/ui/switch";

type BillboardInfoTabProps = {
  form: UseFormReturn<EditBillboardSchemaFormType>;
  cityId: string;
  lastPhotos: string[];
  setLastPhotos: Dispatch<SetStateAction<string[]>>;
  lastBrochures: string[];
  setLastBrochures: Dispatch<SetStateAction<string[]>>;
  ref: RefObject<HTMLInputElement | null>;
};

export default function BillboardInfoTab({
  form,
  lastPhotos,
  setLastBrochures,
  lastBrochures,
  setLastPhotos,
  ref,
  cityId: city,
}: BillboardInfoTabProps) {
  const id = useDataStore.use.currentCompany();
  const [cityId, setCityId] = useState(city);

  const setCities = useCityStore.use.setCity();
  const cities = useCityStore.use.cities();

  const setAreas = useAreaStore.use.setArea();
  const areas = useAreaStore.use.areas();

  const setBillboardType = useBillboardTypeStore.use.setBillboardType();
  const billboardsType = useBillboardTypeStore.use.billboardsType();

  const {
    mutate: mutateArea,
    isPending: isPendingArea,
    data: dataAreas,
  } = useQueryAction<{ cityId: string }, RequestResponse<AreaType[]>>(
    allAreas,
    () => { },
    "areas"
  );

  const {
    mutate: mutateBillboardType,
    isPending: isPendingBillboardType,
    data: dataBillboardType,
  } = useQueryAction<
    { companyId: string },
    RequestResponse<BillboardTypeType[]>
  >(allBillboardType, () => { }, "BillboardsType");

  const {
    mutate: mutateCity,
    isPending: isPendingCity,
    data: dataCities,
  } = useQueryAction<{ companyId: string }, RequestResponse<CityType[]>>(
    allCities,
    () => { },
    "cities"
  );

  useEffect(() => {
    if (id) {
      mutateCity({ companyId: id });
      mutateBillboardType({ companyId: id });
    }
  }, [id]);

  useEffect(() => {
    if (dataCities?.data) {
      setCities(dataCities.data);
    }
  }, [dataCities]);

  useEffect(() => {
    if (dataBillboardType?.data) {
      setBillboardType(dataBillboardType.data);
    }
  }, [dataBillboardType]);

  useEffect(() => {
    if (cityId) {
      mutateArea({ cityId });
    }
  }, [cityId]);

  useEffect(() => {
    if (dataAreas?.data) {
      setAreas(dataAreas.data);
    }
  }, [dataAreas]);

  function removeLastUploadDocuments(name: string, type: "photo" | "brochure") {
    switch (type) {
      case "photo":
        setLastPhotos((prev) => prev.filter((d) => d !== name));
        break;
      case "brochure":
        setLastBrochures((prev) => prev.filter((d) => d !== name));
        break;
    }
  }

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4.5 mx-2 my-4 max-w-xl">
        <FormField
          control={form.control}
          name="billboard"
          render={({ fieldState }) => (
            <FormItem className="w-full">
              <FormControl></FormControl>
              {fieldState.error && (
                <ul className="bg-red/5 p-2 rounded-lg w-full text-red text-xs">
                  {fieldState.error && (
                    <ul className="bg-red/5 p-2 rounded-lg w-full text-red text-xs">
                      La section bailleur présente des erreurs,{" "}
                      {Object.entries(fieldState.error).length > 0 &&
                        "veuiller faire une vérification des champs "}
                      <br />
                      {Object.entries(fieldState.error).map(
                        ([field], index) => (
                          <li key={index}>
                            <span className="font-medium">
                              {
                                billboardError[
                                field as keyof BillboardErrorType
                                ]
                              }
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </ul>
              )}
            </FormItem>
          )}
        />
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">Informations générales</h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="billboard.reference"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Référence"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.hasTax"
              render={({ field }) => (
                <FormItem className="flex h-11 flex-row items-center bg-gray justify-between rounded-lg  p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Article taxable</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.type"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isPendingBillboardType}
                      datas={billboardsType.map((billboardType) => ({
                        id: billboardType.id,
                        label: billboardType.name,
                        value: billboardType.id,
                      }))}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Type de panneau publicitaire"
                      searchMessage="Rechercher un type de panneau"
                      noResultsMessage="Aucune type de panneau trouvé."
                      addElement={<BillboardTypeModal />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.name"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Nom du panneau publicitaire"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.dimension"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Dimension du panneau publicitaire"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.city"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isPendingCity}
                      datas={cities.map((city) => ({
                        id: city.id,
                        label: city.name,
                        value: city.id,
                      }))}
                      value={field.value}
                      setValue={(e) => {
                        field.onChange(e);
                        setCityId(e);
                      }}
                      placeholder="Ville"
                      searchMessage="Rechercher une ville"
                      noResultsMessage="Aucune ville trouvée."
                      addElement={<CityModal />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.area"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isPendingArea}
                      datas={areas.map((area) => ({
                        id: area.id,
                        label: area.name,
                        value: area.id,
                      }))}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Quartier"
                      searchMessage="Rechercher un quartier"
                      noResultsMessage="Aucun quartier trouvé."
                      addElement={<AreaModal cityId={cityId} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboard.placement"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Emplacement du panneau publicitaire"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboard.orientation"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Orientation du panneau publicitaire"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboard.information"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      required={false}
                      design="float"
                      label="Information sur le panneau"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">Emplacement</h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="billboard.address"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Adresse"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.gmaps"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Lien Google Maps"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.zone"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Zone"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">Photos et brochures</h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="billboard.rentalPrice"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Coût de location"
                      value={field.value?.toString()}
                      handleChange={(e) => field.onChange(new Decimal(String(e)))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.installationCost"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Le coût d'installation"
                      value={field.value?.toString()}
                      handleChange={(e) => field.onChange(new Decimal(String(e)))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.maintenance"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Le coût d'entretien"
                      value={field.value?.toString()}
                      handleChange={(e) => field.onChange(new Decimal(String(e)))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboard.imageFiles"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="file"
                      design="float"
                      accept="image/*"
                      label="Importer photo(s)"
                      value={field.value}
                      multiple={true}
                      required={false}
                      inputRef={ref}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.imageFiles"
              render={() => (
                <FormItem className="-space-y-0.5">
                  <FormLabel>Liste des photos enregistrées</FormLabel>
                  <FormControl>
                    <ScrollArea className="bg-gray p-2 border rounded-md h-[100px]">
                      <ul className="space-y-1 w-full text-sm">
                        {lastPhotos.length > 0 ? (
                          lastPhotos.map((document, index) => {
                            return (
                              <li
                                key={index}
                                className="flex justify-between items-center hover:bg-white/50 p-1 rounded"
                              >
                                {index + 1}. {document.split("/").pop()}{" "}
                                <span className="flex items-center gap-x-2">
                                  <span
                                    onClick={() => downloadFile(document)}
                                    className="text-blue cursor-pointer"
                                  >
                                    <DownloadIcon className="w-4 h-4" />
                                  </span>{" "}
                                  <span
                                    onClick={() =>
                                      removeLastUploadDocuments(
                                        document,
                                        "photo"
                                      )
                                    }
                                    className="text-red cursor-pointer"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </span>{" "}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm">Aucune photo trouvée.</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.brochureFiles"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="file"
                      design="float"
                      accept=".pdf,.doc,.docx, image/*"
                      label="Importer brochure(s)"
                      value={field.value}
                      multiple={true}
                      inputRef={ref}
                      handleChange={field.onChange}
                      required={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.brochureFiles"
              render={() => (
                <FormItem className="-space-y-0.5">
                  <FormLabel>Liste des brochures enregistrées</FormLabel>
                  <FormControl>
                    <ScrollArea className="bg-gray p-2 border rounded-md h-[100px]">
                      <ul className="space-y-1 w-full text-sm">
                        {lastBrochures.length > 0 ? (
                          lastBrochures.map((document, index) => {
                            return (
                              <li
                                key={index}
                                className="flex justify-between items-center hover:bg-white/50 p-1 rounded"
                              >
                                {index + 1}. {document.split("/").pop()}{" "}
                                <span className="flex items-center gap-x-2">
                                  <span
                                    onClick={() => downloadFile(document)}
                                    className="text-blue cursor-pointer"
                                  >
                                    <DownloadIcon className="w-4 h-4" />
                                  </span>{" "}
                                  <span
                                    onClick={() =>
                                      removeLastUploadDocuments(
                                        document,
                                        "brochure"
                                      )
                                    }
                                    className="text-red cursor-pointer"
                                  >
                                    <XIcon className="w-4 h-4" />
                                  </span>{" "}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm">Aucune brochure trouvée.</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">Informations techniques</h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="billboard.structure"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={billboardStrucutures}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Structure du panneau publicitaire"
                      searchMessage="Rechercher une structure"
                      noResultsMessage="Aucune structure trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.decorativeElement"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Éléments décoratifs"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.foundations"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Fondations du panneau"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billboard.technicalVisibility"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Visibilité technique"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboard.note"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={generalNotes}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Notes de l'apparence du panneau"
                      searchMessage="Rechercher une note"
                      noResultsMessage="Aucune note trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
