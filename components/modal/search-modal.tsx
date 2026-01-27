import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import SearchButton from "../search/search-button";
import SearchTable from "@/app/(dashboard)/overview/_components/search/search-table";


export default function SearchModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SearchButton />
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-w-242.5! w-full!">
        <VisuallyHidden>
          <DialogTitle />
        </VisuallyHidden>
        <SearchTable />
      </DialogContent>
    </Dialog>
  );
}
