"use client";

import { all } from "@/action/billboard.action";
import Brochure from "@/components/pdf/brochure";
import Spinner from "@/components/ui/spinner";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { useEffect, useState } from "react";

export default function BilloardRentContractPage({ }) {
  const companyId = useDataStore.use.currentCompany();
  const [billboards, setBillboards] = useState<BillboardType[]>([]);



  const { access: readAccess, loading } = useAccess("BILLBOARDS", "READ");

  const { mutate: mutateGetBillboards, isPending: isGettingBillboards } =
    useQueryAction<
      { companyId: string; },
      RequestResponse<BillboardType[]>
    >(all, () => { }, "billboards");



  const refreshBillboard = () => {
    if (companyId && readAccess) {
      mutateGetBillboards(
        { companyId },
        {
          async onSuccess(data) {
            if (data.data) {
              setBillboards(data.data);
            }
          },
        },
      );
    }
  };


  useEffect(() => {
    refreshBillboard();
  }, [companyId, readAccess]);


  if (loading) return <Spinner />

  return (
    <Brochure items={billboards.map((item) => ({
      id: item.id,
      type: item.type.name,
      reference: item.reference,
      name: item.name,
      width: String(item.width),
      height: String(item.height),
      address: item.address,
      orientation: item.orientation,
      dimension: String((Number(item.width) * Number(item.height))),
      images: item.photos,
      maps: item.gmaps,
      color: item.company.documentModel.primaryColor
    }))} />

  );
}
