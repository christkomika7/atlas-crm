import NewEmployeeEditForm from "../../_components/new-employee-edit-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditEmployee() {
  return (
    <div className="h-full">
      <ScrollArea className="w-full h-full">
        <div className="pr-2">
          <NewEmployeeEditForm />
        </div>
      </ScrollArea>
    </div>
  );
}
