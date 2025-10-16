"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { ProductServiceType } from "@/types/product-service.types";
import { all } from "@/action/product-service.action";
import { dropdownMenu } from "./table";
import { cn, formatNumber } from "@/lib/utils";
import { $Enums } from "@/lib/generated/prisma";

type ProductServiceTableProps = {
  filter: $Enums.ProductServiceType;
  selectedProductSerciceIds: string[];
  setSelectedProductServiceIds: Dispatch<SetStateAction<string[]>>;
};

export interface ProductServiceTableRef {
  refreshProductService: () => void;
}

const ProductServiceTable = forwardRef<
  ProductServiceTableRef,
  ProductServiceTableProps
>(
  (
    { selectedProductSerciceIds, setSelectedProductServiceIds, filter },
    ref
  ) => {
    const id = useDataStore.use.currentCompany();

    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: $Enums.ProductServiceType },
      RequestResponse<ProductServiceType[]>
    >(all, () => {}, "product-services");

    const toggleSelection = (productServiceId: string, checked: boolean) => {
      setSelectedProductServiceIds((prev) =>
        checked
          ? [...prev, productServiceId]
          : prev.filter((id) => id !== productServiceId)
      );
    };

    const refreshProductService = () => {
      if (id) {
        mutate({ companyId: id, filter });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshProductService,
    }));

    useEffect(() => {
      refreshProductService();
    }, [id]);

    const isSelected = (id: string) => selectedProductSerciceIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">
                Référence
              </TableHead>
              <TableHead className="font-medium text-center">
                Catégorie
              </TableHead>
              <TableHead className="font-medium text-center">
                Désignation
              </TableHead>
              <TableHead className="font-medium text-center">Somme</TableHead>
              <TableHead className="font-medium text-center">
                En stock
              </TableHead>
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
              data.data.map((productService) => (
                <TableRow
                  key={productService.id}
                  className={`h-16 transition-colors ${
                    isSelected(productService.id) ? "bg-neutral-100" : ""
                  }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(productService.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(productService.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {productService.reference}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {productService.category}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {productService.designation}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(productService.unitPrice)}{" "}
                    {productService.company.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {productService.quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      filter="SERVICE"
                      menus={dropdownMenu}
                      id={productService.id}
                      refreshProductServices={refreshProductService}
                      deleteTitle={cn(
                        "Confirmer la suppression du",
                        productService.type === "PRODUCT"
                          ? "produit"
                          : "service"
                      )}
                      deleteMessage={
                        <p>
                          En supprimant le{" "}
                          {filter === "PRODUCT" ? "produit" : "service"}, toutes
                          les informations liées seront également supprimées.
                          <br />
                          <span className="font-semibold text-red-600">
                            Cette action est irréversible.
                          </span>
                          <br />
                          <br />
                          Confirmez-vous cette suppression ?
                        </p>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-6 text-gray-500 text-sm text-center"
                >
                  Aucun {filter === "PRODUCT" ? "produit" : "service"} trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

ProductServiceTable.displayName = "ProductServiceTable";

export default ProductServiceTable;
