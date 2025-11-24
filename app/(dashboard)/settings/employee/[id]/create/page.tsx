import { ScrollArea } from "@/components/ui/scroll-area";
import CreateEmployeeForm from "../../_components/create-employee-form";

export default function CreateEmployee() {
  return (
    <div className="h-full">
      <ScrollArea className="w-full h-full">
        <div className="pr-2">
          <CreateEmployeeForm />
        </div>
      </ScrollArea>
    </div>
  );
}
