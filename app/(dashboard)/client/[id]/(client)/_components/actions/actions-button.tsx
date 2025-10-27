import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import React from "react";

export default function ActionsButton() {
  const router = useRouter();

  function goto(place: "invoice" | "quote" | "transaction" | "delivery-note") {
    switch (place) {
      case 'invoice':
        router.push('/invoice/create');
        break;
      case 'quote':
        router.push('/quote/create');
        break;
      case 'delivery-note':
        router.push('/delivery-note/create');
        break;
      case 'transaction':
        router.push('/transaction');
        break;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="primary"
          className="flex justify-center items-center w-[120px] font-medium"
        >
          Nouveau
          <ChevronDownIcon className="top-0.5 relative !w-3 !h-3 stroke-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        <DropdownMenuItem onClick={() => goto("invoice")}>Créer un devis</DropdownMenuItem>
        <DropdownMenuItem onClick={() => goto("quote")}>Créer une facture</DropdownMenuItem>
        <DropdownMenuItem onClick={() => goto("delivery-note")}>Créer un bon de livraison</DropdownMenuItem>
        <DropdownMenuItem onClick={() => goto("transaction")}>Créer un relevé</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
