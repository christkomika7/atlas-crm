import { all } from "@/action/product-service.action";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import useQueryAction from "@/hook/useQueryAction";
import { cutText, formatNumber, cn } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useItemStore from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { ProductServiceType } from "@/types/product-service.types";
import { useEffect } from "react";
import { unique } from "@/action/client.action";
import useClientIdStore from "@/stores/client-id.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

export default function ProductServiceTab() {
  const clientId = useClientIdStore.use.clientId();

  const items = useItemStore.use.items();
  const addItem = useItemStore.use.addItem();
  const removeItem = useItemStore.use.removeItem();
  const addQuantity = useItemStore.use.addQuantity();
  const retrieveQuantity = useItemStore.use.retrieveQuantity();
  const companyId = useDataStore.use.currentCompany();

  const {
    mutate: mutateClient,
    data: clientData,
    isPending: isLoadingClient,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType>>(
    unique,
    () => {},
    "client"
  );

  const { mutate, isPending, data } = useQueryAction<
    { companyId: string },
    RequestResponse<ProductServiceType[]>
  >(all, () => {}, "product-services");

  useEffect(() => {
    if (companyId) {
      mutate({ companyId });
    }
  }, [companyId]);

  useEffect(() => {
    if (clientId) {
      mutateClient({ id: clientId });
    }
  }, [clientId]);

  function isSelected(itemId: string) {
    return items.some((i) => i.id === itemId);
  }

  function toggleSelection(check: boolean, item: ProductServiceType) {
    // Vérifier d'abord si un client est sélectionné
    if (!clientId) {
      return toast.error("Veuillez sélectionner un client en premier.");
    }

    // Si on charge encore les données du client, on attend
    if (isLoadingClient) {
      return toast.info("Chargement des informations client...");
    }

    // Obtenir les données du client ou utiliser des valeurs par défaut
    const client = clientData?.data;
    const defaultDiscount = "0"; // Valeur par défaut si pas encore de données client

    if (check) {
      addItem({
        id: item.id,
        name: item.designation,
        description: item.description,
        price: item.unitPrice,
        updatedPrice: "0",
        discountType: "purcent",
        discount: client?.discount || defaultDiscount,
        quantity: 1,
        maxQuantity: item.quantity,
        currency: item.company.currency,
        itemType: item.type === "PRODUCT" ? "product" : "service",
      });
    } else {
      removeItem(item.id);
    }
  }

  return (
    <div className="pt-2">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium" />
            <TableHead className="font-medium text-center">
              Produit / Services
            </TableHead>
            <TableHead className="font-medium text-center">
              Description
            </TableHead>
            <TableHead className="font-medium text-center">Quantité</TableHead>
            <TableHead className="font-medium text-center">Montant</TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : data?.data && data.data.length > 0 ? (
            data.data.map((productService) => {
              const isOutOfStock = Number(productService.quantity) === 0;
              const isItemSelected = isSelected(productService.id);
              const isClientSelected = !!clientId;

              return (
                <TableRow
                  key={productService.id}
                  className={cn(
                    "h-16 transition-colors",
                    isItemSelected ? "bg-neutral-100" : "",
                    (isOutOfStock || !isClientSelected) &&
                      "bg-gray-100 opacity-60 cursor-not-allowed"
                  )}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        disabled={isOutOfStock || !isClientSelected}
                        checked={isItemSelected}
                        onCheckedChange={(checked) =>
                          toggleSelection(!!checked, productService)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {productService.type === "PRODUCT" ? "Produit" : "Service"}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(productService.designation)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {Number(productService.quantity) -
                      Number(
                        items.find((i) => i.id === productService.id)
                          ?.quantity || 0
                      )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(Number(productService.unitPrice))}{" "}
                    {productService.company.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <div className="flex justify-center items-center gap-x-2">
                      <Button
                        disabled={
                          isOutOfStock || !isItemSelected || !isClientSelected
                        }
                        onClick={() => {
                          toggleSelection(true, productService);
                          addQuantity(
                            productService.id,
                            Number(productService.quantity)
                          );
                        }}
                        variant="primary"
                        className="bg-blue/5 shadow-none border-2 border-blue !size-6 text-blue"
                      >
                        <PlusIcon />
                      </Button>

                      <Button
                        disabled={
                          isOutOfStock || !isItemSelected || !isClientSelected
                        }
                        onClick={() => {
                          const newQuantity = retrieveQuantity(
                            productService.id,
                            0
                          );
                          if (newQuantity === 0) {
                            toggleSelection(false, productService);
                          }
                        }}
                        variant="primary"
                        className="bg-red/5 shadow-none border-2 border-red !size-6 text-red"
                      >
                        <MinusIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucun produit ou service trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
