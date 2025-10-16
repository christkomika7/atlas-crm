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
import { Role } from "@/lib/generated/prisma";
import { useDataStore } from "@/stores/data.store";

export default function CountrySelect() {
  const [companyCountries, setCompanyCountries] =
    useState<CompanyCountriesType[]>();
  const [companyCountry, setCompanyCountry] = useState<CompanyCountriesType>();

  const id = useDataStore.use.id();
  const role = useDataStore.use.role();
  const currentCompany = useDataStore.use.currentCompany();
  const setCurrentCompany = useDataStore.use.setCurrentCompany();
  const setCurrency = useDataStore.use.setCurrency();
  const { mutate, isPending, data } = useQueryAction<
    { id: string; currentCompany?: string },
    RequestResponse<CompanyCountriesType | CompanyCountriesType[]>
  >(countries, () => {}, "countries");

  useEffect(() => {
    if (id) {
      mutate(
        { id },
        {
          onSuccess(data) {
            const companyData = data.data;
            if (companyData && Array.isArray(companyData)) {
              setCompanyCountries(companyData);
            } else {
              setCompanyCountry(companyData);
            }
          },
        }
      );
    }
  }, [id]);

  function handleCompany(current: string) {
    if (id) {
      mutate(
        { id, currentCompany: current },
        {
          onSuccess(data) {
            const companyData = data.data;
            setCurrentCompany(current);
            if (companyData && Array.isArray(companyData)) {
              setCompanyCountries(companyData);
              setCurrency(
                companyData.find((c) => c.id === current)?.currency ?? ""
              );
            } else {
              setCompanyCountry(companyData);
              setCurrency(companyData?.currency ?? "");
            }
          },
        }
      );
    }
  }

  if (isPending && (!companyCountry || !companyCountries))
    return <Skeleton className="rounded-lg w-[200px] h-11" />;

  if (!data?.data || (Array.isArray(data.data) && data.data.length === 0)) {
    return null;
  }

  return (
    <>
      {role === Role.USER && companyCountry && (
        <span className="flex items-center space-x-2 bg-neutral-100 p-2 rounded-md w-full h-11">
          <span className="flex rounded w-12 h-7">
            {getFlagUrl(companyCountry!.country) && (
              <Image
                src={getFlagUrl(companyCountry!.country) as string}
                alt={companyCountry!.country}
                width={48}
                height={28}
                className="rounded w-full h-full overflow-hidden"
              />
            )}
          </span>
          <span className="flex flex-col justify-start items-start font-semibold">
            {companyCountry!.country &&
              getCountryFrenchName(companyCountry!.country)}
            <small className="font-normal text-xs">
              {companyCountry.companyName}
            </small>
          </span>
        </span>
      )}

      {role === Role.ADMIN &&
        Array.isArray(companyCountries) &&
        currentCompany && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="select" className="w-[230px] !h-12">
                <div className="flex justify-between items-center pr-1 w-full">
                  <span className="flex items-center gap-x-2">
                    <span className="rounded w-12 h-8">
                      {getFlagUrl(
                        companyCountries.find((c) => c.id === currentCompany)
                          ?.country ?? ""
                      ) && (
                        <Image
                          src={
                            getFlagUrl(
                              companyCountries.find(
                                (c) => c.id === currentCompany
                              )?.country ?? ""
                            ) as string
                          }
                          alt={
                            companyCountries.find(
                              (c) => c.id === currentCompany
                            )?.country ?? ""
                          }
                          width={48}
                          height={28}
                          className="rounded w-full h-full overflow-hidden"
                        />
                      )}
                    </span>
                    <span className="flex flex-col justify-start items-start font-semibold">
                      {companyCountries.find((c) => c.id === currentCompany)
                        ?.country &&
                        getCountryFrenchName(
                          companyCountries.find((c) => c.id === currentCompany)
                            ?.country ?? ""
                        )}
                      <small className="font-normal text-xs">
                        {
                          companyCountries.find((c) => c.id === currentCompany)
                            ?.companyName
                        }
                      </small>
                    </span>
                  </span>
                  <span className="top-0.5 relative flex w-3 h-3">
                    <ChevronDownIcon className="stroke-neutral-600" />
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[230px]">
              {(data?.data as CompanyCountriesType[])?.map(
                ({ id, country, companyName }) => (
                  <DropdownMenuItem key={id} onClick={() => handleCompany(id)}>
                    <span className="items-center space-x-2 grid grid-cols-[48px_1fr]">
                      <span className="flex rounded h-8">
                        {getFlagUrl(country) && (
                          <Image
                            src={getFlagUrl(country) as string}
                            alt={country}
                            width={48}
                            height={32}
                            className="rounded w-full h-full overflow-hidden"
                          />
                        )}
                      </span>
                      <span className="flex flex-col justify-start items-start font-medium text-sm">
                        {country && getCountryFrenchName(country)}
                        <small className="font-normal text-xs">
                          {companyName}
                        </small>
                      </span>
                    </span>
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
    </>
  );
}
