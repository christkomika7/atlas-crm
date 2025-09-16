import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SearchButton from "../search/search-button";
import SearchTable from "@/app/(dashboard)/overview/_components/search/search-table";

export default function SearchModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SearchButton />
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="!max-w-[970px] !w-full">
        <SearchTable />
      </DialogContent>
    </Dialog>
  );
}
