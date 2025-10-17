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
import { RequestResponse } from "@/types/api.types";
import { ProductServiceType } from "@/types/product-service.types";
import { useEffect } from "react";
import { unique } from "@/action/supplier.action";
import { toast } from "sonner";
import Decimal from "decimal.js";
import useSupplierIdStore from "@/stores/supplier-id.store";
import { SupplierType } from "@/types/supplier.types";
import usePurchaseItemStore from "@/stores/purchase-item.store";


type ProductServiceTabProps = {
  productServices: ProductServiceType[];
  isGettingProductServices: boolean;
}

export default function ProductServiceTab({ productServices, isGettingProductServices }: ProductServiceTabProps) {
  const supplierId = useSupplierIdStore.use.supplierId();

  const items = usePurchaseItemStore.use.items();
  const addItem = usePurchaseItemStore.use.addItem();
  const removeItem = usePurchaseItemStore.use.removeItem();

  function isSelected(productServiceId: string) {
    return items.some((i) => i.productServiceId === productServiceId);
  }

  function toggleSelection(check: boolean, productService: ProductServiceType) {

    // Vérifier si l'item existe déjà
    const existingItem = items.find(
      (item) => item.productServiceId === productService.id
    );

    if (check) {
      if (existingItem) {
        // Si déjà coché, on décoche et réinitialise
        removeItem(productService.id);
      } else {
        // Ajouter un nouvel item avec quantité sélectionnée = 1
        const randomUUID = crypto.randomUUID();
        addItem({
          id: randomUUID,
          hasTax: productService.hasTax,
          name: productService.designation,
          description: productService.description,
          price: new Decimal(productService.cost),
          updatedPrice: new Decimal(0),
          discountType: "purcent",
          discount: "0",
          quantity: productService.quantity,
          selectedQuantity: 1,
          currency: productService.company.currency,
          itemType: productService.type === "PRODUCT" ? "product" : "service",
          productServiceId: productService.id,
        });
      }
    } else {
      // Décocher : supprimer l'item
      if (existingItem) {
        removeItem(productService.id);
      }
    }
  }


  function getItemQuantity(productServiceId: string) {
    const item = items.find((i) => i.productServiceId === productServiceId);
    return item?.selectedQuantity ?? 0;
  }

  function getCurrentQuantity(productServiceId: string, quantity: number) {
    const lastSelectedQuantity = items.find(i => i.productServiceId === productServiceId)?.lastSelectedQuantity;

    if (lastSelectedQuantity) return quantity - lastSelectedQuantity;
    return quantity

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
            <TableHead className="font-medium text-center">
              Quantité disponible
            </TableHead>
            <TableHead className="font-medium text-center">
              Quantité sélectionnée
            </TableHead>
            <TableHead className="font-medium text-center">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isGettingProductServices ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : productServices.length > 0 ? (
            productServices.map((productService) => {
              const isItemSelected = isSelected(productService.id);
              const selectedQuantity = getItemQuantity(productService.id);

              return (
                <TableRow
                  key={productService.id}
                  className={cn(
                    "h-16 transition-colors",
                    isItemSelected ? "bg-neutral-100" : ""
                  )}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
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
                    {getCurrentQuantity(productService.id, productService.quantity)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {isItemSelected ? (
                      <div className="flex justify-center items-center gap-2">
                        <span className="font-medium text-blue-600 min-w-[30px]">
                          {selectedQuantity}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(Number(productService.unitPrice))}{" "}
                    {productService.company.currency}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
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