import { all } from "@/action/billboard.action";
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
import { getEnableDate } from "@/lib/date";
import { cn, formatNumber } from "@/lib/utils";
import useClientIdStore from "@/stores/client-id.store";
import useItemStore from "@/stores/item.store";
import useRecordIdStore from "@/stores/record-id.store";
import { BillboardType } from "@/types/billboard.types";
import Decimal from "decimal.js";
import { toast } from "sonner";

type BillboardTabProps = {
  billboards: BillboardType[];
  isGettingBillboards: boolean
}

export default function BillboardTab({ isGettingBillboards, billboards }: BillboardTabProps) {
  const clientId = useClientIdStore.use.clientId();
  const invoiceId = useRecordIdStore.use.recordId();

  const items = useItemStore.use.items();
  const addItem = useItemStore.use.addItem();
  const removeLocationBillboard = useItemStore.use.removeLocationBillboard();
  const addLocationBillboard = useItemStore.use.addLocationBillboard();
  const removeItem = useItemStore.use.removeItem();
  const locationBillboardDate = useItemStore.use.locationBillboardDate();

  function isSelected(billboardId: string) {
    return items.some((i) => i.billboardId === billboardId);
  }

  function toggleSelection(check: boolean, billboard: BillboardType) {
    // Vérifier d'abord si un client est sélectionné
    if (!clientId) {
      return toast.error("Veuillez sélectionner un client en premier.");
    }
    const randomUUID = crypto.randomUUID();

    const defaultDiscount = "0";
    const enableDate = getEnableDate(locationBillboardDate, billboard.id, invoiceId);


    if (check) {
      addLocationBillboard({
        id: billboard.id,
        billboardReference: billboard.id,
        isNew: true,
        locationDate: [new Date(), new Date()],
      });

      addItem({
        id: randomUUID,
        name: billboard.name,
        reference: billboard.reference,
        hasTax: billboard.hasTax,
        description: "",
        price: new Decimal(billboard.rentalPrice),
        billboardReference: billboard.id,
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
          {isGettingBillboards ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : billboards.length > 0 ? (
            billboards.map((billboard) => {
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
