"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "../icons";
import Image from "next/image";
import { countries } from "@/action/company.action";
import { Skeleton } from "../ui/skeleton";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useEffect, useState } from "react";
import { CompanyCountriesType } from "@/types/company.types";
import { getCountryFrenchName, getFlagUrl } from "@/lib/helper";
import { useDataStore } from "@/stores/data.store";
import { useRouter } from "next/navigation";

export default function CountrySelect() {
  const router = useRouter();
  const [companyCountries, setCompanyCountries] =
    useState<CompanyCountriesType[]>();

  const userId = useDataStore.use.id();
  const currentCompany = useDataStore.use.currentCompany();
  const setCurrentCompany = useDataStore.use.setCurrentCompany();
  const setCurrency = useDataStore.use.setCurrency();

  const { mutate, isPending } = useQueryAction<
    { id: string; currentCompany?: string },
    RequestResponse<CompanyCountriesType[]>
  >(countries, () => { }, "countries");

  useEffect(() => {
    if (!userId) return;

    mutate(
      { id: userId },
      {
        onSuccess(res) {
          const companies = res.data ?? [];
          setCompanyCountries(companies);

          if (!currentCompany && companies.length > 0) {
            setCurrentCompany(companies[0].id);
            setCurrency(companies[0].currency);
          }
        },
      }
    );
  }, [userId]);

  useEffect(() => {

  }, [companyCountries, currentCompany])

  const handleCompany = (companyId: string) => {
    if (!userId) return;

    mutate(
      { id: userId, currentCompany: companyId },
      {
        onSuccess(res) {
          const companies = res.data ?? [];
          setCompanyCountries(companies);
          setCurrentCompany(companyId);
          const selected = companies.find((c) => c.id === companyId);
          setCurrency(selected?.currency ?? "");

          window.location.reload();
        },
      }
    );
  };


  const current = companyCountries?.find((c) => c.id === currentCompany);


  return (

    <>
      {isPending || !companyCountries ? <Skeleton className="rounded-lg w-[230px] h-[48px]" /> :
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="select" className="w-[230px] !h-12">
              <div className="flex justify-between items-center pr-1 w-full">
                <span className="flex items-center gap-x-2">
                  <span className="rounded w-12 h-8">
                    {current?.country && (
                      <Image
                        src={getFlagUrl(current.country) as string}
                        alt={current.country}
                        width={48}
                        height={28}
                        className="rounded w-full h-full overflow-hidden"
                      />
                    )}
                  </span>
                  <span className="flex flex-col justify-start items-start font-semibold">
                    {current?.country && getCountryFrenchName(current.country)}
                    <small className="font-normal text-xs">
                      {current?.companyName}
                    </small>
                  </span>
                </span>
                <span className="!size-4 flex justify-center items-center">
                  <ChevronDownIcon className="stroke-neutral-600 w-3 h-3" />
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[230px]">
            {companyCountries.map(({ id, country, companyName }) => (
              <DropdownMenuItem key={id} onClick={() => handleCompany(id)}>
                <span className="grid grid-cols-[48px_1fr] items-center gap-x-2">
                  <span className="rounded h-8 overflow-hidden flex">
                    {country && (
                      <Image
                        src={getFlagUrl(country) as string}
                        alt={country}
                        width={48}
                        height={32}
                        className="rounded w-full h-full"
                      />
                    )}
                  </span>
                  <span className="flex flex-col justify-start items-start font-medium text-sm">
                    {getCountryFrenchName(country)}
                    <small className="font-normal text-xs">{companyName}</small>
                  </span>
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </>

  );
}
