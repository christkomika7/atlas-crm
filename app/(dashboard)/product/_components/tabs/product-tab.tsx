import { Dispatch, RefObject, SetStateAction } from "react";
import ProductServiceTable, {
  ProductServiceTableRef,
} from "../product-service-table";

type ProductTabProps = {
  productServiceTableRef: RefObject<ProductServiceTableRef | null>;
  selectedProductServiceIds: string[];
  setSelectedProductServiceIds: Dispatch<SetStateAction<string[]>>;
};

export default function ProductTab({
  productServiceTableRef,
  selectedProductServiceIds,
  setSelectedProductServiceIds,
}: ProductTabProps) {
  return (
    <div className="pt-4">
      <ProductServiceTable
        filter="PRODUCT"
        ref={productServiceTableRef}
        selectedProductSerciceIds={selectedProductServiceIds}
        setSelectedProductServiceIds={setSelectedProductServiceIds}
      />
    </div>
  );
}
