import { BillboardInfo } from "@/types/item.type";
import React from "react";

type BillboardDetailsProps = {
  detail: BillboardInfo;
};

export default function BillboardDetails({ detail }: BillboardDetailsProps) {
  return (
    <div className="bg-neutral-50 p-3">
      <h2 className="font-semibold">Détails du panneau</h2>
      <div className="w-full h-fit">
        <div className="space-y-2 pt-9 text-sm">
          <p className="flex justify-between items-center gap-x-2">
            <span className="font-semibold">Nom</span>{" "}
            <span>{detail.name}</span>
          </p>
          <p className="flex justify-between items-center gap-x-2">
            <span className="font-semibold">Catégories</span>{" "}
            <span>{detail.category}</span>
          </p>
          <p className="flex justify-between items-center gap-x-2">
            <span className="font-semibold">Quartier</span>{" "}
            <span>{detail.neighbourhood}</span>
          </p>
          <p className="flex justify-between items-center gap-x-2">
            <span className="font-semibold">Emplacement</span>{" "}
            <span>{detail.address}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
