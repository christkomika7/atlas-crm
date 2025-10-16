import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";
import Spinner from "./spinner";

type ConfirmDialogProps = {
  type: "delete";
  title: string;
  message: string | React.ReactNode;
  action: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  type,
  title,
  message,
  action,
  loading,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {type === "delete" ? (
          <button className="flex items-center gap-x-2 hover:bg-red/5 px-4 py-3 w-full font-medium text-red text-sm cursor-pointer">
            <Trash2Icon className="w-4 h-4" />
            Supprimer
          </button>
        ) : null}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-neutral-100 shadow-none text-neutral-600 cursor-pointer">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={action}
            className="bg-blue hover:bg-blue/80 cursor-pointer"
          >
            {loading ? <Spinner /> : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
