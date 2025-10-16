import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFileByType } from "@/lib/file-storage";
import { cutText, initialName, resolveImageSrc } from "@/lib/utils";
import { useEmployeeStore } from "@/stores/employee.store";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type EmployeeCardProps = {
  id: string | number;
  name: string;
  imageKey: string;
};

export default function EmployeeCard({
  id,
  name,
  imageKey,
}: EmployeeCardProps) {
  const [image, setImage] = useState<string | undefined>("");
  const { removeEmployee } = useEmployeeStore();

  async function getFile(name: string) {
    const file = await getFileByType(name, "profile");
    return resolveImageSrc(file);
  }

  useEffect(() => {
    const isKey = imageKey.includes("@");

    const fetchImage = async () => {
      if (isKey) {
        const file = await getFile(imageKey);
        if (file) {
          setImage(file);
        }
      } else {
        setImage(imageKey);
      }
    };

    fetchImage();
  }, [imageKey]);

  function deleteEmployee(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeEmployee(id as number);
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="relative">
        <button
          onClick={deleteEmployee}
          className="top-0 -right-1 z-20 absolute flex justify-center items-center bg-red border-2 border-white rounded-full size-4.5 cursor-pointer"
        >
          <XIcon className="size-3 text-white" />
        </button>
        <Link href={`/settings/employee/${id}`}>
          <Avatar className="size-14">
            {imageKey && (
              <AvatarImage className="bg-gray object-cover" src={image} />
            )}
            <AvatarFallback>{initialName(name)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <p className="font-medium text-sm">{cutText(name)}</p>
    </div>
  );
}
