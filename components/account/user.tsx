import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { initialName } from "@/lib/utils";

type UserProps = {
  user: {
    image: string;
    name: string;
  };
  size?: number;
};

export default function User({ user, size = 46 }: UserProps) {
  return (
    <Avatar
      style={{
        width: size,
        height: size,
      }}
    >
      {user.image && (
        <AvatarImage className="object-center object-cover" src={user.image} />
      )}
      <AvatarFallback>{initialName(user.name)}</AvatarFallback>
    </Avatar>
  );
}
