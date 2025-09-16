import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";

export default function ActionsButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="primary"
          className="flex justify-center items-center w-fit font-medium"
        >
          Nouveau
          <ChevronDownIcon className="top-0.5 relative !w-3 !h-3 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Créer un devis</DropdownMenuItem>
        <DropdownMenuItem>Créer une facture</DropdownMenuItem>
        <DropdownMenuItem>Créer un bon de livraison</DropdownMenuItem>
        <DropdownMenuItem>Créer un relevé</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
