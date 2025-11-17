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
  useState,
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
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import Paginations from "@/components/paginations";

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
    const [items, setItems] = useState<ProductServiceType[]>([]);


    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [totalItems, setTotalItems] = useState<number>(0);

    const skip = (currentPage - 1) * pageSize;

    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: $Enums.ProductServiceType, skip?: number; take?: number },
      RequestResponse<ProductServiceType[]>
    >(all, () => { }, "product-services");

    const toggleSelection = (productServiceId: string, checked: boolean) => {
      setSelectedProductServiceIds((prev) =>
        checked
          ? [...prev, productServiceId]
          : prev.filter((id) => id !== productServiceId)
      );
    };

    const refreshProductService = () => {
      if (id) {
        mutate({ companyId: id, filter, take: pageSize, skip }, {
          onSuccess(data) {
            if (data.data) {
              setItems(data.data);
              setTotalItems(data.total ?? 0);
            }
          },
        });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshProductService,
    }));

    useEffect(() => {
      refreshProductService();
    }, [id, currentPage]);

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
            ) : items.length > 0 ? (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={`h-16 transition-colors ${isSelected(item.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(item.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(item.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {item.reference}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {item.designation}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(item.unitPrice)}{" "}
                    {item.company.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      filter="SERVICE"
                      menus={dropdownMenu}
                      id={item.id}
                      refreshProductServices={refreshProductService}
                      deleteTitle={cn(
                        "Confirmer la suppression du",
                        item.type === "PRODUCT"
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
);

ProductServiceTable.displayName = "ProductServiceTable";

export default ProductServiceTable;
