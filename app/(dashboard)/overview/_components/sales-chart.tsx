'use client';

import { useEffect, useState } from "react";
import { SaleBarChart } from "./sale-bar-chart";
import { CategoryDetailType, CategoryFilterType, CategoryItemType, NatureItemType } from "@/types/transaction.type";
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
  const [natureDetails, setNatureDetails] = useState<NatureItemType[]>([]);

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
            setTotal(data.data.total)
            setCategoryFilters(data.data.categories);
            setNatureDetails(data.data.natures);
          }
        },
      })
    }
  }, [companyId, range, category])

  return (
    <div className="p-4 border border-neutral-200 rounded-lg">
      <div className="flex justify-between items-center ">
        <h2 className="flex flex-col space-y-0.5 text-sm">
          <span className="font-semibold">Déboursement par période</span> {isGettingCategoryFilters ? <Spinner /> : <span className="font-semibold">{formatNumber(total)} {currency}</span>}
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
            width={300}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1.2fr_1fr]">
        <ul className="space-y-1.5 flex flex-col justify-center">
          {isGettingCategoryDetails || isGettingCategoryFilters ? (
            <Spinner />
          ) : category ? (
            natureDetails.map((item, index) => {
              const color = colors[index]?.color ?? "#cccccc";
              return (
                <li key={item.natureId} className="text-xs flex">
                  <span className="flex items-center gap-x-1 font-medium uppercase">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {item.name} ( {item.percent} )
                  </span>
                </li>
              );
            })
          ) : (
            categoryDetails.map((item, index) => {
              const color = colors[index]?.color ?? "#cccccc";
              return (
                <li key={item.categoryId} className="text-xs flex">
                  <span className="flex items-center gap-x-1 font-medium uppercase">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    {item.categoryName} ( {Math.round(Number(item.percentage))}% )
                  </span>
                </li>
              );
            })
          )}
        </ul>

        <div>
          <SaleBarChart items={[...(category ? natureDetails.map(n => ({ id: n.natureId, name: n.name, total: n.total })) : categoryFilters.map(c => ({ id: c.categoryId, name: c.categoryName, total: c.total })))]} currency={currency} isLoading={isGettingCategoryFilters} />
        </div>

      </div>
    </div>
  );
}
