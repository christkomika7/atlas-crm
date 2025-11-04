'use client';

import { useEffect, useState } from "react";
import { SaleBarChart } from "./sale-bar-chart";
import { CategoryDetailType, CategoryFilterType, CategoryItemType } from "@/types/transaction.type";
import { useDataStore } from "@/stores/data.store";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { getCategoryByFilters, getCategoryDetails } from "@/action/transaction.action";
import { colors } from "@/lib/data";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import Spinner from "@/components/ui/spinner";
import { formatNumber } from "@/lib/utils";
import Decimal from "decimal.js";

export default function SalesChart() {
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetailType[]>([])
  const [categoryFilters, setCategoryFilters] = useState<CategoryItemType[]>([]);
  const [total, setTotal] = useState<Decimal>(new Decimal(0));
  const [range, setRange] = useState<{ from: Date, to: Date }>();
  const [category, setCategory] = useState("");

  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const { mutate: mutateGetCategoryDetails, isPending: isGettingCategoryDetails } = useQueryAction<
    { companyId: string },
    RequestResponse<CategoryDetailType[]>
  >(getCategoryDetails, () => { }, "details");

  const { mutate: mutateGetCategoryFilters, isPending: isGettingCategoryFilters } = useQueryAction<
    { companyId: string, range?: { from?: Date, to?: Date }, category?: string },
    RequestResponse<CategoryFilterType>
  >(getCategoryByFilters, () => { }, "filters");

  useEffect(() => {
    if (companyId) {
      mutateGetCategoryDetails({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setCategoryDetails(data.data);
          }
        },
      })
    }
  }, [companyId])


  useEffect(() => {
    if (companyId) {
      mutateGetCategoryFilters({ companyId, range: { from: range?.from, to: range?.to }, category }, {
        onSuccess(data) {
          if (data.data) {
            console.log({ data: data.data })
            setTotal(data.data.total)
            setCategoryFilters(data.data.items);
          }
        },
      })
    }
  }, [companyId, range, category])


  return (
    <div className="p-4 border border-neutral-200 rounded-lg">
      <div className="flex justify-between items-center ">
        <h2 className="flex flex-col space-y-0.5 text-sm">
          <span className="font-semibold">Ventes par période</span> {isGettingCategoryFilters ? <Spinner /> : `${formatNumber(total)} ${currency}`}
        </h2>
        <div className="gap-x-2 grid grid-cols-[1.5fr_1fr]  w-full max-w-sm ">
          <DatePicker
            cut={28}
            label="Durée"
            mode="range"
            value={range}
            onChange={(e) => {
              setRange(e as { from: Date; to: Date })
            }}
          />
          <Combobox
            cut={14}
            isLoading={isGettingCategoryDetails}
            datas={
              categoryDetails.map((categoryDetail) => ({
                id: categoryDetail.categoryId,
                label: categoryDetail.categoryName,
                value: categoryDetail.categoryId,
              })) ?? []
            }
            value={category}
            setValue={setCategory}
            placeholder="Catégorie"
            searchMessage="Rechercher une catégorie"
            noResultsMessage="Aucune catégorie trouvée."
          />
        </div>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr]">
        <ul className="space-y-1.5 flex flex-col justify-center">
          {isGettingCategoryDetails ? <Spinner /> :
            categoryDetails.map((category, index) => {
              const color = colors[index]?.color ?? "#cccccc";
              return (
                <li key={category.categoryId} className="text-xs flex">
                  <span className="flex items-center gap-x-1 font-medium uppercase">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {category.categoryName} ( {Math.round(Number(category.percentage))}% )
                  </span>
                </li>
              );
            })
          }
        </ul>
        <div>
          <SaleBarChart items={categoryFilters} currency={currency} isLoading={isGettingCategoryFilters} />
        </div>

      </div>
    </div>
  );
}
