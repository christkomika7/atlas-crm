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
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
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
          size === "sm" && "!max-w-[512px]",
          size === "md" && "!max-w-[672px]",
          size === "lg" && "!max-w-[768px]",
          size === "xl" && "!max-w-[896px]",
          size === "2xl" && "!max-w-[1024px]"
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
