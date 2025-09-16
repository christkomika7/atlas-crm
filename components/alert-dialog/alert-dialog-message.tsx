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
import Spinner from "../ui/spinner";
import { cn } from "@/lib/utils";

type AlertDialogMessageProps = {
  type?: "default" | "delete";
  actionButton: React.ReactNode;
  title: string;
  message: React.ReactNode | string;
  confirmAction: () => void;
  isLoading?: boolean;
};

export default function AlertDialogMessage({
  type = "default",
  actionButton,
  title,
  message,
  confirmAction,
  isLoading,
}: AlertDialogMessageProps) {
  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger
        asChild
        onClick={handleButtonClick}
        onMouseDown={handleButtonClick}
        className="cursor-pointer"
      >
        {actionButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleButtonClick}
            onMouseDown={handleButtonClick}
            className="focus-visible:ring-0 cursor-pointer"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleButtonClick}
            onMouseDown={(e) => {
              handleButtonClick(e);
              confirmAction();
            }}
            className={cn(
              "cursor-pointer",
              type === "default" && "bg-blue hover:bg-blue/80",
              type === "delete" && "bg-red hover:bg-red/80"
            )}
          >
            {isLoading ? (
              <Spinner />
            ) : type === "default" ? (
              "Valider"
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
