import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PopoverContainerProps = {
  actionButton: React.ReactNode;
  children: React.ReactNode;
};

export default function PopoverContainer({
  actionButton,
  children,
}: PopoverContainerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{actionButton}</PopoverTrigger>
      <PopoverContent>{children}</PopoverContent>
    </Popover>
  );
}
