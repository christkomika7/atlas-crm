import EditEmployeeForm from "../../../../settings/employee/_components/edit-employee-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function EditEmployee() {
  const data = await getSession();
  const isAdmin = data?.user.role === "ADMIN" ? true : false;
  if (!isAdmin) {
    notFound();
  }
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
