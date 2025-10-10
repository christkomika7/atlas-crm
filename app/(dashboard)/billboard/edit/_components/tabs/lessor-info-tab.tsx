import { all } from "@/action/supplier.action";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment, leasedSpace, lessorSpaceType, lessorType } from "@/lib/data";
import { downloadFile } from "@/lib/utils";
import {
  EditBillboardSchemaFormType,
  lessorError,
  LessorErrorType,
} from "@/lib/zod/billboard.schema";
import useBillboardStore from "@/stores/billboard.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { SupplierType } from "@/types/supplier.types";
import { DownloadIcon, XIcon } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Decimal } from "decimal.js"
type LessorInfoTabProps = {
  form: UseFormReturn<EditBillboardSchemaFormType>;
  lastContracts: string[];
  setLastContracts: Dispatch<SetStateAction<string[]>>;
  lastFiles: string[];
  setLastFiles: Dispatch<SetStateAction<string[]>>;
  ref: RefObject<HTMLInputElement | null>;
};

export default function LessorInfoTab({
  form,
  lastContracts,
  setLastContracts,
  lastFiles,
  setLastFiles,
  ref,
}: LessorInfoTabProps) {
  const setCurrentSpaceType = useBillboardStore.use.setCurrentSpaceType();
  const currentSpaceType = useBillboardStore.use.currentSpaceType?.();

  const [suppliers, setSupplier] = useState<SupplierType[]>([]);
  const companyId = useDataStore.use.currentCompany()


  const { mutate: mutateGetSuppliers, isPending: isGettingSuppliers } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType[]>
  >(all, () => { }, "suppliers");

  useEffect(() => {
    if (companyId) {
      mutateGetSuppliers({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setSupplier(data.data);
          }
        },
      });
    }
  }, [companyId]);


  function removeLastUploadDocuments(name: string, type: "contract" | "file") {
    switch (type) {
      case "contract":
        setLastContracts((prev) => prev.filter((d) => d !== name));
        break;
      case "file":
        setLastFiles((prev) => prev.filter((d) => d !== name));
        break;
    }
  }
  return (
    <ScrollArea className="pr-4 h-full">
      <div className="space-y-4.5 mx-2 my-4 max-w-xl">
        <FormField
          control={form.control}
          name="lessor"
          render={({ fieldState }) => (
            <FormItem className="w-full">
              <FormControl></FormControl>
              {fieldState.error && (
                <ul className="bg-red/5 p-2 rounded-lg w-full text-red text-xs">
                  La section bailleur présente des erreurs,{" "}
                  {Object.entries(fieldState.error).length > 0 &&
                    "veuiller faire une vérification des champs "}
                  <br />
                  {Object.entries(fieldState.error).map(([field], index) => (
                    <li key={index}>
                      <span className="font-medium">
                        {lessorError[field as keyof LessorErrorType]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </FormItem>
          )}
        />
        <div className="space-y-2.5">
          <h2 className="font-semibold text-sm">
            Informations sur le bailleur
          </h2>
          <div className="space-y-4.5">
            <FormField
              control={form.control}
              name="lessor.lessorType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={lessorType}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Type de bailleur"
                      searchMessage="Rechercher un type de bailleur"
                      noResultsMessage="Aucun type trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lessor.lessorSpaceType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={lessorSpaceType}
                      value={currentSpaceType ?? ""}
                      setValue={e => {
                        setCurrentSpaceType(e as "private" | "public");
                        field.onChange(e);
                      }}
                      placeholder="Type d'espace"
                      searchMessage="Rechercher un type d'espce"
                      noResultsMessage="Aucun type d'espace trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentSpaceType === "public" &&
              <FormField
                control={form.control}
                name="lessor.lessorCustomer"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        isLoading={isGettingSuppliers}
                        datas={suppliers.map(supplier => ({
                          id: supplier.id,
                          label: `${supplier.companyName} - ${supplier.firstname} ${supplier.lastname}`,
                          value: supplier.id
                        }))}
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Bailleur"
                        searchMessage="Rechercher un bailleur"
                        noResultsMessage="Aucun bailleur trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />}
            {currentSpaceType === "private" && <>
              <FormField
                control={form.control}
                name="lessor.lessorName"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Nom du bailleur"
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
                name="lessor.lessorEmail"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Adresse mail du bailleur"
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
                name="lessor.lessorPhone"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Numéro de téléphone du bailleur"
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
                name="lessor.lessorJob"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Poste du bailleur"
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
                name="lessor.capital"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="number"
                        design="float"
                        label="Capital du bailleur"
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
                name="lessor.rccm"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Registre du commerce (RCCM)"
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
                name="lessor.taxIdentificationNumber"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Numéro d'identification fiscale"
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
                name="lessor.lessorAddress"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Adresse complète du bailleur"
                        value={field.value}
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </>}
          </div>
        </div>
        {currentSpaceType === "private" && <>
          <div className="space-y-2.5">
            <h2 className="font-semibold text-sm">
              {" "}
              Représentant légal (entreprise)
            </h2>
            <div className="space-y-4.5">
              <FormField
                control={form.control}
                name="lessor.representativeName"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Nom du représentant légal"
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
                name="lessor.representativeContract"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Informations du contact du représentant légal"
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
            <h2 className="font-semibold text-sm">Détails du contrat</h2>
            <div className="space-y-4.5">
              <FormField
                control={form.control}
                name="lessor.leasedSpace"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        datas={leasedSpace}
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Le type d'espace loué"
                        searchMessage="Rechercher un type d'espace loué"
                        noResultsMessage="Aucun type d'espace loué trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.contractDuration"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <DatePicker
                        required={false}
                        label="Durée du contrat"
                        mode="range"
                        value={
                          field.value?.from && field.value.to
                            ? {
                              from: new Date(field.value.from),
                              to: new Date(field.value.to),
                            }
                            : undefined
                        }
                        onChange={(e) => {
                          const range = e as { from: Date; to: Date } | undefined;
                          field.onChange(
                            range ? { from: range.from, to: range.to } : undefined
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessor.paymentMethod"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        datas={acceptPayment}
                        value={field.value as string}
                        setValue={field.onChange}
                        placeholder="Méthodes de paiement"
                        searchMessage="Rechercher une méthodes de paiement"
                        noResultsMessage="Aucune méthodes de paiement trouvée."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lessor.specificCondition"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        design="float"
                        label="Conditions spécifiques ou restriction"
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
            <h2 className="font-semibold text-sm">Informations techniques</h2>
            <div className="space-y-4.5">
              <FormField
                control={form.control}
                name="lessor.signedLeaseContract"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="file"
                        design="float"
                        accept=".pdf,.doc,.docx, image/*"
                        label="Contrat de location signé"
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
                name="lessor.lastSignedLeaseContract"
                render={() => (
                  <FormItem className="-space-y-0.5">
                    <FormLabel>Liste des contrats signés enregistrés</FormLabel>
                    <FormControl>
                      <ScrollArea className="bg-gray p-2 border rounded-md h-[100px]">
                        <ul className="space-y-1 w-full text-sm">
                          {lastContracts.length > 0 ? (
                            lastContracts.map((document, index) => {
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
                                          "contract"
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
                            <li className="text-sm">Aucun contrat trouvé.</li>
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
                name="lessor.files"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        type="file"
                        design="float"
                        accept=".pdf,.doc,.docx, image/*"
                        required={false}
                        label="Pièces jointes supplémentaires"
                        value={field.value}
                        multiple={true}
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
                name="lessor.lastFiles"
                render={() => (
                  <FormItem className="-space-y-0.5">
                    <FormLabel>Liste des fichiers enregistrés</FormLabel>
                    <FormControl>
                      <ScrollArea className="bg-gray p-2 border rounded-md h-[100px]">
                        <ul className="space-y-1 w-full text-sm">
                          {lastFiles.length > 0 ? (
                            lastFiles.map((document, index) => {
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
                                          "file"
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
                            <li className="text-sm">Aucun fichier trouvé.</li>
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
        </>}
      </div>
    </ScrollArea>
  );
}
