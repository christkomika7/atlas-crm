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
import { cutText, formatNumber, cn } from "@/lib/utils";
import useItemStore from "@/stores/item.store";
import { ProductServiceType } from "@/types/product-service.types";
import useClientIdStore from "@/stores/client-id.store";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import Paginations from "@/components/paginations";
import { SetStateAction } from "react";

type ProductServiceTabProps = {
  productServices: ProductServiceType[];
  isGettingProductServices: boolean;
  totalItems: number;
  pageSize: number;
  currentPage: number;
  setCurrentPage: (value: SetStateAction<number>) => void
}

export default function ProductServiceTab({ productServices, isGettingProductServices,
  totalItems, pageSize, currentPage, setCurrentPage
}: ProductServiceTabProps) {
  const clientId = useClientIdStore.use.clientId();

  const items = useItemStore.use.items();
  const addItem = useItemStore.use.addItem();
  const removeItem = useItemStore.use.removeItem();


  function isSelected(productServiceId: string) {
    return items.some((i) => i.productServiceId === productServiceId);
  }

  function toggleSelection(check: boolean, productService: ProductServiceType) {
    // Vérifier d'abord si un client est sélectionné
    if (!clientId) {
      return toast.error("Veuillez sélectionner un client en premier.");
    }

    const defaultDiscount = "0";
    const randomUUID = crypto.randomUUID()

    if (check) {
      addItem({
        id: randomUUID,
        reference: productService.reference,
        hasTax: productService.hasTax,
        name: productService.designation,
        description: productService.description,
        price: new Decimal(productService.unitPrice),
        updatedPrice: new Decimal(0),
        discountType: "purcent",
        discount: defaultDiscount,
        quantity: 1,
        locationStart: new Date(),
        locationEnd: new Date(),
        maxQuantity: productService.quantity,
        currency: productService.company.currency,
        itemType: productService.type === "PRODUCT" ? "product" : "service",
        productServiceId: productService.id
      });
    } else {
      removeItem(productService.id);
    }
  }

  function currentQuantity(productServiceId: string, quantity: number) {
    const productServiceItem = items.filter(p => p.itemType !== "billboard");
    const item = productServiceItem.find(item => item.productServiceId && item.productServiceId === productServiceId);
    if (item?.lastQuantity) {
      return (quantity + item.lastQuantity) - Math.abs(item.quantity - item.lastQuantity);
    }
    return quantity - Number(item?.quantity ?? 0)
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {isGettingProductServices ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : productServices.length > 0 ? (
            productServices.map((productService) => {
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
                    {currentQuantity(productService.id, productService.quantity)}
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
                colSpan={9}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucun produit ou service trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end p-4">
        <Paginations
          totalItems={totalItems}
          pageSize={pageSize}
          controlledPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisiblePages={DEFAULT_PAGE_SIZE}
        />
      </div>
    </div>
  );
}
