import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import BillboardBrochureModal from "./billboard-create-brochure-modal";

export default function HeaderMenu() {
  const router = useRouter();

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
            <BillboardBrochureModal>
              <Button
                variant="primary"
                className="bg-white hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
              >
                Brochure
              </Button>
            </BillboardBrochureModal>

          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
}
