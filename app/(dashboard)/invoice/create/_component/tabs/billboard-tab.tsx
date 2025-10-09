import { all } from "@/action/billboard.action";
import { unique } from "@/action/client.action";
import { allBillboardItem } from "@/action/item.action";
import BillboardStatus from "@/app/(dashboard)/billboard/_component/billboard-status";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import useQueryAction from "@/hook/useQueryAction";
import { paymentTerms } from "@/lib/data";
import { addDays, getEnableDate } from "@/lib/date";
import { cn, formatNumber } from "@/lib/utils";
import useClientIdStore from "@/stores/client-id.store";
import { useDataStore } from "@/stores/data.store";
import useItemStore from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { ClientType } from "@/types/client.types";
import Decimal from "decimal.js";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillboardTab() {
  const [locationEndDate, setLocationEndDate] = useState<Date | undefined>(undefined);
  const companyId = useDataStore.use.currentCompany();
  const clientId = useClientIdStore.use.clientId();

  const items = useItemStore.use.items();
  const addItem = useItemStore.use.addItem();
  const removeLocationBillboard = useItemStore.use.removeLocationBillboard();
  const addLocationBillboard = useItemStore.use.addLocationBillboard();
  const removeItem = useItemStore.use.removeItem();
  const locationBillboardDate = useItemStore.use.locationBillboardDate();

  const { mutate, isPending, data } = useQueryAction<
    { companyId: string },
    RequestResponse<BillboardType[]>
  >(all, () => { }, "billboards");

  const {
    mutate: mutateClient,
    isPending: isLoadingClient,
    data: clientData,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType>>(
    unique,
    () => { },
    "client"
  );

  useEffect(() => {
    if (companyId) {
      mutate({ companyId });
    }
  }, [companyId]);

  useEffect(() => {
    if (clientId) {
      mutateClient({ id: clientId }, {
        onSuccess(data) {
          if (data.data) {
            const client = data.data;
            setLocationEndDate(
              addDays(
                new Date(),
                paymentTerms.find((p) => p.value === client.paymentTerms)
                  ?.data ?? 0
                , "date") as Date
            )
          }

        },
      });
    }
  }, [clientId]);

  function isSelected(billboardId: string) {
    return items.some((i) => i.billboardId === billboardId);
  }

  function toggleSelection(check: boolean, billboard: BillboardType) {
    // Vérifier d'abord si un client est sélectionné
    if (!clientId) {
      return toast.error("Veuillez sélectionner un client en premier.");
    }
    const reference = crypto.randomUUID();
    const randomUUID = crypto.randomUUID();

    const defaultDiscount = "0";
    const enableDate = getEnableDate(locationBillboardDate);

    if (check) {
      addLocationBillboard({
        id: billboard.id,
        billboardReference: reference,
        isNew: true,
        locationDate: [new Date(), new Date()],
      });

      addItem({
        id: randomUUID,
        name: billboard.name,
        description: billboard.information,
        price: new Decimal(billboard.rentalPrice),
        billboardReference: reference,
        updatedPrice: new Decimal(0),
        discountType: "purcent",
        discount: defaultDiscount,
        quantity: 1,
        locationStart: enableDate,
        locationEnd: enableDate,
        currency: billboard.company.currency,
        itemType: "billboard",
        billboardId: billboard.id
      });

    } else {
      removeLocationBillboard(billboard.id);
      removeItem(billboard.id);
    }
  }


  return (
    <div className="pt-2">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium" />
            <TableHead className="font-medium text-center">
              Ref du panneau
            </TableHead>
            <TableHead className="font-medium text-center">Nom</TableHead>
            <TableHead className="font-medium text-center">
              Disponibilité
            </TableHead>
            <TableHead className="font-medium text-center">Montant</TableHead>
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
            data.data.map((billboard) => {
              const isClientSelected = !!clientId;
              return (
                <TableRow
                  key={billboard.id}
                  className={cn(
                    "h-16 transition-colors",
                    isSelected(billboard.id) && "bg-neutral-100",
                    !isClientSelected &&
                    "bg-gray-100 opacity-50 cursor-not-allowed"
                  )}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        disabled={!isClientSelected}
                        checked={isSelected(billboard.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(!!checked, billboard)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {billboard.reference}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {billboard.name}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <BillboardStatus items={billboard.items.map(item => [item.locationStart, item.locationEnd])} />
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(Number(billboard.rentalPrice))}{" "}
                    {billboard.company.currency}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucun panneau publicitaire trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
