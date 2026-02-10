"use client";
import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { cn, cutText } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { FloatingInput, FloatingLabel } from "./floating-input";

type ComboboxProps = {
  datas: {
    id: string | number;
    icon?: string;
    value: string;
    label: string;
    more?: Record<string, string>;
    color?: string;
    disabled?: boolean;
  }[];
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
  cut?: number;
  placeholder?: string;
  searchMessage?: string;
  noResultsMessage?: string;
  required?: boolean;
  isLoading?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  addElement?: React.ReactNode;
  width?: number
};

export function Combobox({
  placeholder,
  searchMessage,
  noResultsMessage,
  value,
  cut,
  setValue,
  datas,
  required = true,
  isLoading = false,
  className = "",
  inputClassName = "",
  disabled,
  addElement,
  width
}: ComboboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const getDisplayValue = () => {
    if (!value) return "";
    const selectedData = datas.find((data) => data.value === value);
    return cut ? cutText(selectedData?.label || "", cut) : selectedData?.label || "";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={className} disabled={disabled}>
        <div className="relative">
          <FloatingInput
            ref={ref}
            disabled={true}
            type="text"
            id="country"
            value={getDisplayValue()}
            required={required}
            className={cn(inputClassName, { "bg-gray/60": disabled })}
          />
          <FloatingLabel htmlFor="country" className="gap-x-0! cursor-default!">
            {placeholder} {placeholder && required && <span className="text-red-500">*</span>}
          </FloatingLabel>
          <span className="top-1/2 right-2 absolute -translate-y-1/2">
            <ChevronsUpDownIcon className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="p-0"
        style={{ width: width ? width : ref.current?.offsetWidth }}
      >
        <Command>
          <CommandInput placeholder={searchMessage} disabled={isLoading} />
          <CommandList>
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>{noResultsMessage}</CommandEmpty>
                <CommandGroup>
                  {datas.map((data) => {
                    const isDisabled = data.disabled ?? false;
                    return (
                      <CommandItem
                        key={data.value}
                        value={data.label}
                        disabled={isDisabled}
                        className={cn(
                          "flex items-center text-sm gap-2",
                          isDisabled
                            ? "text-gray-400 cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        )}
                        onSelect={() => {
                          if (isDisabled) return;
                          if (value === data.value) {
                            setValue("");
                          } else {
                            setValue(data.value);
                          }
                          setOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 w-4 h-4",
                            value === data.value ? "opacity-100" : "opacity-0"
                          )}
                        />

                        {data.color && (
                          <span
                            className={cn("rounded-full w-4 h-4", data.color)}
                          />
                        )}
                        <span className="text-sm">{data.label}</span>
                        {data.more && (
                          <span className="text-neutral-500 text-xs">
                            ( {data.more.type} : {data.more.price} )
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
          {addElement && (
            <>
              <CommandSeparator />
              <CommandGroup>{addElement}</CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}