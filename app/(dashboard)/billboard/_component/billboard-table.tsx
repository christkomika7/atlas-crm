"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { BillboardType } from "@/types/billboard.types";
import { all } from "@/action/billboard.action";
import { formatNumber } from "@/lib/utils";
import TableActionButton from "./table-action-button";
import { dropdownMenu } from "./table";
import BillboardPhoto from "./billboard-photo";
import BillboardStatus from "./billboard-status";
import { ItemType } from "@/types/item.type";

type BillboardTableProps = {
  selectedBillboardIds: string[];
  setSelectedBillboardIds: Dispatch<SetStateAction<string[]>>;
};

export interface BillboardTableRef {
  refreshBillboard: () => void;
}

const BillboardTable = forwardRef<BillboardTableRef, BillboardTableProps>(
  ({ selectedBillboardIds, setSelectedBillboardIds }, ref) => {
    const companyId = useDataStore.use.currentCompany();
    const [billboards, setBillboards] = useState<BillboardType[]>([]);

    const { mutate: mutateGetBillboards, isPending: isGettingBillboards } = useQueryAction<
      { companyId: string },
      RequestResponse<BillboardType[]>
    >(all, () => { }, "billboards");

    const toggleSelection = (billboardId: string, checked: boolean) => {
      setSelectedBillboardIds((prev) =>
        checked
          ? [...prev, billboardId]
          : prev.filter((id) => id !== billboardId)
      );
    };

    const refreshBillboard = () => {
      if (companyId) {
        mutateGetBillboards({ companyId }, {
          async onSuccess(data) {
            if (data.data) {
              setBillboards(data.data);
            }
          },
        });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshBillboard,
    }));

    useEffect(() => {
      refreshBillboard();
    }, [companyId]);

    const isSelected = (id: string) => selectedBillboardIds.includes(id);

    function getGenerateRevenue(items: ItemType[]) {
      const revenue = items.reduce((p, c) => p + (c.quantity * Number(c.price)), 0);
      return revenue.toString();
    }

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">Photo</TableHead>
              <TableHead className="font-medium text-center">
                Référence
              </TableHead>
              <TableHead className="font-medium text-center">Type</TableHead>
              <TableHead className="font-medium text-center">Nom</TableHead>
              <TableHead className="font-medium text-center">
                Revenus générés
              </TableHead>
              <TableHead className="font-medium text-center">Status</TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
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
            ) : billboards && billboards.length > 0 ? (
              billboards.map((billboard) => (
                <TableRow
                  key={billboard.id}
                  className={`h-16 transition-colors ${isSelected(billboard.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(billboard.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(billboard.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <BillboardPhoto path={billboard.photos.length > 0 ? billboard.photos[0] : undefined} name={billboard.name.toUpperCase()} />
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {billboard.reference.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {billboard.type.name}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {billboard.name}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(getGenerateRevenue(billboard.items))}
                    {billboard.company.currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <BillboardStatus items={billboard.items.map(item => [item.locationStart, item.locationEnd])} />
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={billboard.id}
                      refreshBillboard={refreshBillboard}
                      deleteTitle="Confirmer la suppression du panneau"
                      deleteMessage={
                        <p>
                          En supprimant un panneau, toutes les informations
                          liées seront également supprimées.
                          <br />
                          <span className="font-semibold text-red-600">
                            Cette action est irréversible.
                          </span>
                          <br />
                          <br />
                          Confirmez-vous cette suppression ?
                        </p>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
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
);

BillboardTable.displayName = "BillboardTable";

export default BillboardTable;
