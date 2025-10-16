import EditEmployeeForm from "../../../employee/_components/edit-employee-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditEmployee() {
  return (
    <div className="h-full">
      <ScrollArea className="w-full h-full">
        <div className="pr-2">
          <EditEmployeeForm />
        </div>
      </ScrollArea>
    </div>
  );
}
