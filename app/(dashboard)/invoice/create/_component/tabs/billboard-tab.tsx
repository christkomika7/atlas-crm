import { all } from "@/action/billboard.action";
import { unique } from "@/action/client.action";
import { allBillboardItem } from "@/action/item.action";
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
import { addDays, getDateStatus } from "@/lib/date";
import { cn, formatNumber } from "@/lib/utils";
import useClientIdStore from "@/stores/client-id.store";
import { useDataStore } from "@/stores/data.store";
import useItemStore from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { ClientType } from "@/types/client.types";
import { ItemType } from "@/types/item.type";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BillboardTab() {
  // ** STATE ** //
  const [locationEndDate, setLocationEndDate] = useState<Date | undefined>(undefined);
  const [currentItemId, setCurrentItemId] = useState<string>();


  // ** STORE ** //
  // # DATA STORE
  const companyId = useDataStore.use.currentCompany();

  // # CLIENT STORE
  const clientId = useClientIdStore.use.clientId();

  // # ITEM STORE
  const items = useItemStore.use.items();
  const addItem = useItemStore.use.addItem();
  const addLocationBillboard = useItemStore.use.addLocationBillboard();
  const clearLocationBillboard = useItemStore.use.clearLocationBillboard();
  const removeLocationBillboard = useItemStore.use.removeLocationBillboard();
  const removeItem = useItemStore.use.removeItem();



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

  const { mutate: getBillboardItems, isPending: isGettingBillboardItems } =
    useQueryAction<{ billboardId: string }, RequestResponse<ItemType[]>>(
      allBillboardItem,
      () => { },
      "items"
    );

  useEffect(() => {
    clearLocationBillboard();
  }, []);

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

  function isSelected(itemId: string) {
    return items.some((i) => i.id === itemId);
  }

  function toggleSelection(check: boolean, item: BillboardType) {
    // Vérifier d'abord si un client est sélectionné
    if (!clientId) {
      return toast.error("Veuillez sélectionner un client en premier.");
    }

    // Si on charge encore les données du client, on attend
    if (isLoadingClient) {
      return toast.info("Chargement des informations client...");
    }

    // Obtenir les données du client ou utiliser des valeurs par défaut
    const client = clientData?.data;
    const defaultDiscount = "0"; // Valeur par défaut si pas encore de données client
    setCurrentItemId(item.id);

    if (check) {
      getBillboardItems(
        { billboardId: item.id },
        {
          onSuccess(data) {
            if (data.data) {
              const billboardItem = data.data;
              const status = getDateStatus({
                startDate: item.locationDuration?.[0] && new Date(item.locationDuration[0]),
                endDate: item.locationDuration?.[1] && new Date(item.locationDuration[1]),
              });
              addLocationBillboard({
                id: item.id,
                locationDate: billboardItem.length > 0
                  ? [new Date(billboardItem[0].locationStart), new Date(billboardItem[0].locationEnd)] as [Date, Date]
                  : [new Date(), new Date()] as [Date, Date],
              });
              addItem({
                id: item.id,
                name: item.name,
                description: item.information,
                price: item.rentalPrice,
                updatedPrice: "0",
                discountType: "purcent",
                lastDate: item.locationDuration?.[1],
                discount: client?.discount || defaultDiscount,
                quantity: 1,
                locationStart: new Date(),
                locationEnd: locationEndDate,
                status: status === "red" ? "non-available" : "available",
                currency: item.company.currency,
                itemType: "billboard",
              });
              setCurrentItemId("")
            }
          },
        }
      );
    } else {
      removeItem(item.id);
      removeLocationBillboard(item.id);
      setCurrentItemId("");
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
            <TableHead className="font-medium text-center w-[40px]"></TableHead>
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
              const status = getDateStatus({
                startDate: billboard.locationDuration?.[0] && new Date(billboard.locationDuration[0]),
                endDate: billboard.locationDuration?.[1] && new Date(billboard.locationDuration[1]),
              });
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
                    <span
                      className={cn(
                        "flex mx-auto rounded-full w-5 h-5",
                        status === "red" && "bg-red",
                        status === "yellow" && "bg-amber-400",
                        status === "green" && "bg-emerald-500"
                      )}
                    ></span>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(Number(billboard.rentalPrice))}{" "}
                    {billboard.company.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {currentItemId === billboard.id && isGettingBillboardItems && <Spinner />}
                    </div>
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
