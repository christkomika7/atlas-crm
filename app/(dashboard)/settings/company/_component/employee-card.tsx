import { deleteUser } from "@/action/user.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { cutText, initialName, resolveImageSrc, urlToFile } from "@/lib/utils";
import { RequestResponse } from "@/types/api.types";
import { ProfileType } from "@/types/user.types";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type EmployeeCardProps = {
  profile: ProfileType;
  refresh: () => void;
};

export default function EmployeeCard({
  profile,
  refresh
}: EmployeeCardProps) {
  const [image, setImage] = useState<string | undefined>("");

  const { mutate, isPending } = useQueryAction<
    { id: string },
    RequestResponse<ProfileType>
  >(deleteUser, () => { }, "users");


  async function getProfil() {
    if (profile.image) {
      const file = await urlToFile(profile.image);
      const resolveImage = resolveImageSrc(file);
      if (resolveImage) {
        setImage(resolveImage)
      }
    }
  }

  useEffect(() => {
    getProfil()
  }, [profile])


  function removeUser(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (profile.user.id) {
      mutate({ id: profile.id }, {
        onSuccess() {
          refresh();
        }
      });
    }
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="relative">
        <button
          onClick={(e) => removeUser(e)}
          className="top-0 -right-1 z-20 absolute flex justify-center items-center bg-red border-2 border-white rounded-full size-4.5 cursor-pointer"
        >
          {isPending ? <Spinner size={10} /> :
            <XIcon className="size-3 text-white" />
          }
        </button>
        <Link href={`/settings/employee/${profile.id}`}>
          <Avatar className="size-14">
            <AvatarImage className="bg-gray object-cover" src={image} />
            <AvatarFallback>{initialName(`${profile.firstname} ${profile.lastname}`)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
      <p className="font-medium text-sm">{cutText(`${profile.firstname} ${profile.lastname}`, 14)}</p>
    </div>
  );
}
