import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import BrochurePDF from "./brochure";
import { pdf } from "@react-pdf/renderer";

export default function HeaderMenu() {
  const router = useRouter();

  async function downloadPdf(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    const doc = <BrochurePDF />;

    const asBlob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(asBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "contrat.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="primary" className="p-0 rounded-lg">
          <CirclePlus className="w-4 h-4" /> Créer
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-[180px]">
        <ul className="p-2">
          <li>
            <Button
              onClick={() => router.push("/billboard/create")}
              variant="primary"
              className="bg-white hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Nouveau panneau
            </Button>
          </li>
          <li>
            <Button
              onClick={(e) => downloadPdf(e)}
              variant="primary"
              className="bg-white hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Brochure
            </Button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
