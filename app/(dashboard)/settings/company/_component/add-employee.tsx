import { PlusIcon } from "lucide-react";
import Link from "next/link";

type AddEmployeeProps = {
  companyId: string;
}

export default function AddEmployee({ companyId }: AddEmployeeProps) {
  return (
    <Link href={`/settings/employee/${companyId}/create`}>
      <button className="flex flex-col items-center space-y-1 cursor-pointer">
        <div className="flex justify-center items-center bg-black rounded-full size-14">
          <PlusIcon className="text-white" />
        </div>
        <p className="font-medium text-sm">Ajouter</p>
      </button>
    </Link>
  );
}
