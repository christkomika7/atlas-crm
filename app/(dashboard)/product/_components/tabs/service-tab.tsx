import { Dispatch, RefObject, SetStateAction } from "react";
import ProductServiceTable, {
  ProductServiceTableRef,
} from "../product-service-table";

type PastTabProps = {
  productServiceTableRef: RefObject<ProductServiceTableRef | null>;
  selectedProductServiceIds: string[];
  setSelectedProductServiceIds: Dispatch<SetStateAction<string[]>>;
};

export default function ServiceTab({
  productServiceTableRef,
  selectedProductServiceIds,
  setSelectedProductServiceIds,
}: PastTabProps) {
  return (
    <div className="pt-4">
      <ProductServiceTable
        filter="SERVICE"
        ref={productServiceTableRef}
        selectedProductSerciceIds={selectedProductServiceIds}
        setSelectedProductServiceIds={setSelectedProductServiceIds}
      />
    </div>
  );
}
