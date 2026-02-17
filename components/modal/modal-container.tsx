import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalContainerProps = {
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | '3xl' | '4xl';
  title: string;
  description?: string;
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
};

export default function ModalContainer({
  action,
  title,
  size = "md",
  children,
  open,
  description,
  setOpen,
  onClose,
}: ModalContainerProps) {
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  };

  const handleButtonClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {action && (
        <DialogTrigger
          asChild
          onClick={handleButtonClick}
          onMouseDown={handleButtonClick}
        >
          {action}
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          size === "sm" && "max-w-lg!",
          size === "md" && "max-w-2xl!",
          size === "lg" && "max-w-3xl!",
          size === "xl" && "max-w-4xl!",
          size === "2xl" && "max-w-5xl!",
          size === "3xl" && "max-w-361!",
          size === "4xl" && "max-w-456!",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
