"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs } from "@/components/ui/tabs";

import DocumentPreview from "../document-preview";
import QuotesTab from "./quotes-tab";
import InvoicesTab from "./invoices-tab";
import PurchaseOrderTab from "./purchase-order-tab";
import DeliveryNotesTab from "./delivery-notes-tab";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import TextInput from "@/components/ui/text-input";
import { useDataStore } from "@/stores/data.store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircleWarningIcon } from "lucide-react";
import { toast } from "sonner";
import { documentSchema, DocumentSchemaType } from "@/lib/zod/document.schema";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ModelDocumentType } from "@/types/document.types";
import { unique, update } from "@/action/document.action";
import Spinner from "@/components/ui/spinner";
import { resolveImageSrc, urlToFile } from "@/lib/utils";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function DocumentTab() {
  const idCompany = useDataStore.use.currentCompany();

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [logo, setLogo] = useState<File | string>();

  const [quotes, setQuotes] = useState({
    prefix: "",
    notes: "",
  });

  const [invoices, setInvoices] = useState({
    prefix: "",
    notes: "",
  });

  const [deliveryNotes, setDeliveryNotes] = useState({
    prefix: "",
    notes: "",
  });

  const [purchaseOrders, setPurchaseOrders] = useState({
    prefix: "",
    notes: "",
  });

  const [colors, setColors] = useState({
    primary: "#fbbf24",
    secondary: "#fef3c7",
  });


  const [dimension, setDimension] = useState<{
    size: string;
    position: string;
  }>({ size: "Medium", position: "Center" });


  const { access: readAccess, loading } = useAccess("SETTING", "READ");
  const { access: modifyAccess } = useAccess("SETTING", "MODIFY");

  const { mutate: mutateDocument, isPending: isDocumentPending } =
    useQueryAction<{ id: string }, RequestResponse<ModelDocumentType>>(
      unique,
      () => { },
      ["model-document"]
    );

  const { mutate: updateDocument, isPending: updateDocumentPending } =
    useQueryAction<
      DocumentSchemaType & { id: string },
      RequestResponse<ModelDocumentType>
    >(update, () => { }, ["model-document"]);

  useEffect(() => {
    if (idCompany && readAccess) {
      initDocument()
    }
  }, [idCompany, readAccess]);


  function initDocument() {
    mutateDocument(
      { id: idCompany },
      {
        onSuccess(data) {
          if (data.data) {
            const doc = data.data;
            setDocumentId(doc?.id || "");

            setQuotes({
              prefix: doc?.quotesPrefix || "",
              notes: doc?.quotesInfo || "",
            });
            setInvoices({
              prefix: doc?.invoicesPrefix || "",
              notes: doc?.invoicesInfo || "",
            });
            setDeliveryNotes({
              prefix: doc?.deliveryNotesPrefix || "",
              notes: doc?.deliveryNotesInfo || "",
            });
            setPurchaseOrders({
              prefix: doc?.purchaseOrderPrefix || "",
              notes: doc?.purchaseOrderInfo || "",
            });
            setColors({
              primary: doc!.primaryColor,
              secondary: doc!.secondaryColor,
            });

            setLogo(doc?.logo);
            setDimension({
              size: doc?.size || "Medium",
              position: doc?.position || "Center",
            });
          }
        },
      }
    );
  }

  useEffect(() => {
    getLogo()
  }, [logo])

  async function getLogo() {
    if (!logo) {
      setPreview("")
    }

    if (logo && typeof logo === "string") {
      const file = await urlToFile(logo);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setPreview(resolveImage)
      }
    }

    if (logo && logo instanceof File) {
      setPreview(resolveImageSrc(logo) as string);
    }
  }



  function submit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const file = logo instanceof File ? logo : undefined
    const data: DocumentSchemaType = {
      companyId: idCompany,
      logo: file,
      size: dimension.size,
      position: dimension.position,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      quotes: {
        prefix: quotes.prefix ?? "",
        notes: quotes.notes ?? "",
      },
      invoices: {
        prefix: invoices.prefix ?? "",
        notes: invoices.notes ?? "",
      },
      deliveryNotes: {
        prefix: deliveryNotes.prefix ?? "",
        notes: deliveryNotes.notes ?? "",
      },
      purchaseOrders: {
        prefix: purchaseOrders.prefix ?? "",
        notes: purchaseOrders.notes ?? "",
      },
    };

    const validateDate = documentSchema.safeParse(data);
    if (!validateDate.success) {
      const errors = validateDate.error.issues.map((issue) => issue.message);
      toast.error(`${errors.join(", ")}`);
      return;
    }

    if (documentId) {
      updateDocument({ ...data, id: documentId }, {
        onSuccess() {
          initDocument()
        },
      });
      return;
    }
    return toast.error("Aucun document trouvé.");
  }

  if (isDocumentPending || loading) {
    return <Spinner />;
  }


  return (
    <AccessContainer hasAccess={readAccess} resource="SETTING" >
      {!idCompany ?
        <Alert variant="primary">
          <MessageCircleWarningIcon />
          <AlertTitle>Entreprise non sélectionnée</AlertTitle>
          <AlertDescription>
            Veuillez choisir une entreprise avant de poursuivre la configuration
            des documents.
          </AlertDescription>
        </Alert>
        :
        <ScrollArea className="pr-4 h-full">
          <div className="gap-x-2 grid grid-cols-[1fr_1.3fr] pt-4 h-full">
            <div className="space-y-4 w-full">
              <h2 className="font-semibold text-xl">Configuration</h2>
              <TextInput
                type="file"
                value={logo}
                disabled={!modifyAccess}
                accept="image/png, image/jpeg, image/jpg"
                handleChange={(file) =>
                  setLogo(file as File)
                }
              />
              <Combobox
                className="w-full"
                disabled={!modifyAccess}
                datas={[
                  { id: 1, value: "Left", label: "Gauche" },
                  { id: 2, value: "Right", label: "Droite" },
                  { id: 3, value: "Center", label: "Centre" },
                ]}
                value={dimension?.position ?? "Center"}
                setValue={(value) =>
                  setDimension({ ...dimension, position: value as string })
                }
                placeholder="Position du logo"
                searchMessage="Rechercher une position"
                noResultsMessage="Aucune position trouvée."
              />
              <Combobox
                disabled={!modifyAccess}
                className="w-full"
                datas={[
                  { id: 1, value: "Small", label: "Petite" },
                  { id: 2, value: "Medium", label: "Moyenne" },
                  { id: 3, value: "Large", label: "Grande" },
                ]}
                value={dimension?.size ?? "Medium"}
                setValue={(value) => setDimension({ ...dimension, size: value as string })}
                placeholder="Taille du logo"
                searchMessage="Rechercher une taille"
                noResultsMessage="Aucune taille trouvée."
              />

              <div className="gap-x-2 grid grid-cols-2 bg-gray px-2 py-2 rounded-lg w-full h-fit">
                <div className="items-center gap-x-2 grid grid-cols-[30px_1fr]">
                  <span className="font-medium text-sm">Trait</span>
                  <input
                    disabled={!modifyAccess}
                    type="color"
                    className="bg-white p-0.5 !border w-full text-sm text-center"
                    value={colors.primary}
                    onChange={(e) =>
                      setColors({
                        ...colors,
                        primary: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="items-center gap-x-2 grid grid-cols-[40px_1fr]">
                  <span className="font-medium text-sm">Bande</span>
                  <input
                    disabled={!modifyAccess}
                    type="color"
                    className="bg-white p-0.5 !border w-full text-sm text-center"
                    value={colors.secondary}
                    onChange={(e) =>
                      setColors({
                        ...colors,
                        secondary: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Tabs
                className="h-fit"
                tabs={[
                  {
                    id: 1,
                    title: "Devis",
                    content: (
                      <QuotesTab
                        disabled={!modifyAccess}
                        prefix={quotes.prefix}
                        setPrefix={(value) =>
                          setQuotes({ ...quotes, prefix: value })
                        }
                        notes={quotes.notes}
                        setNotes={(value) => setQuotes({ ...quotes, notes: value })}
                      />
                    ),
                  },
                  {
                    id: 2,
                    title: "Factures",
                    content: (
                      <InvoicesTab
                        disabled={!modifyAccess}
                        prefix={invoices.prefix}
                        setPrefix={(value) =>
                          setInvoices({ ...invoices, prefix: value })
                        }
                        notes={invoices.notes}
                        setNotes={(value) =>
                          setInvoices({ ...invoices, notes: value })
                        }
                      />
                    ),
                  },
                  {
                    id: 3,
                    title: "Bons de livraison",
                    content: (
                      <DeliveryNotesTab
                        disabled={!modifyAccess}
                        prefix={deliveryNotes.prefix}
                        setPrefix={(value) =>
                          setDeliveryNotes({ ...deliveryNotes, prefix: value })
                        }
                        notes={deliveryNotes.notes}
                        setNotes={(value) =>
                          setDeliveryNotes({ ...deliveryNotes, notes: value })
                        }
                      />
                    ),
                  },
                  {
                    id: 4,
                    title: "Bons de commande",
                    content: (
                      <PurchaseOrderTab
                        disabled={!modifyAccess}
                        prefix={purchaseOrders.prefix}
                        setPrefix={(value) =>
                          setPurchaseOrders({ ...purchaseOrders, prefix: value })
                        }
                        notes={purchaseOrders.notes}
                        setNotes={(value) =>
                          setPurchaseOrders({ ...purchaseOrders, notes: value })
                        }
                      />
                    ),
                  },
                ]}
                tabId="document"
              />

              {modifyAccess &&
                <Button onClick={submit} disabled={updateDocumentPending} variant="primary" className="max-w-[200px]">
                  {updateDocumentPending ? <Spinner /> : "Valider"}
                </Button>
              }
            </div>
            <div className="space-y-2 pl-2 border-l w-full min-w-[700px]">
              <h2 className="font-semibold text-xl">Aperçu</h2>
              <DocumentPreview
                firstColor={colors.primary}
                secondColor={colors.secondary}
                logo={preview}
                logoSize={dimension?.size}
                logoPosition={dimension?.position}
              />
            </div>
          </div>
        </ScrollArea>
      }
    </AccessContainer>
  );
}
