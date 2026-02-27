"use client";

import * as React from "react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

export interface Option {
  label: string;
  value: string;
  disable?: boolean;
  imageUrl?: string;
}

export interface MultipleSelectProps {
  options: Option[];
  value?: Option[]; // Composant contrôlé
  onChange?: (selected: Option[]) => void;
  label: React.ReactNode | string;
  placeholder?: string;
  defaultOptions?: Option[]; // Composant non contrôlé
  className?: string;
  badgeClassName?: string;
  emptyIndicator?: React.ReactNode;
  loadingIndicator?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MultipleSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner",
  defaultOptions = [],
  className,
  label,
  badgeClassName,
  emptyIndicator = (
    <p className="px-2 py-2 text-muted-foreground text-sm">Aucune option</p>
  ),
  loadingIndicator = (
    <p className="px-2 py-2 text-muted-foreground text-sm">Chargement...</p>
  ),
  isLoading = false,
  disabled,
}: MultipleSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] =
    React.useState<Option[]>(defaultOptions);
  const selected = isControlled ? value! : internalSelected;
  const [search, setSearch] = React.useState("");

  const handleUnselect = (item: Option) => {
    const updated = selected.filter((i) => i.value !== item.value);
    if (!isControlled) {
      setInternalSelected(updated);
    }
    onChange?.(updated);
  };

  const handleSelect = (item: Option) => {
    const isAlreadySelected = selected.some((i) => i.value === item.value);
    const updated = isAlreadySelected
      ? selected.filter((i) => i.value !== item.value)
      : [...selected, item];

    if (!isControlled) {
      setInternalSelected(updated);
    }
    onChange?.(updated);
  };

  const isSelected = (item: Option) =>
    selected.some((i) => i.value === item.value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "relative justify-between bg-gray hover:bg-gray shadow-none border-gray w-full !h-11 !text-neutral-700 hover:!text-neutral-700",
              !selected.length && "text-muted-foreground"
            )}
          >
            <label className="-top-3 left-2 absolute bg-gray px-2.5 rounded-full text-[11px] text-neutral-700">
              {label}
            </label>
            {selected.length > 0 ? (
              <div className="flex items-center gap-1 max-w-[calc(100%-32px)] overflow-hidden">
                {selected.slice(0, 2).map((item) => (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className={cn("bg-slate-200 shrink-0", badgeClassName)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(item);
                    }}
                  >
                    {item.label}
                    <X className="ml-1 w-2.5 h-2.5 cursor-pointer" />
                  </Badge>
                ))}
                {selected.length > 2 && (
                  <Badge variant="secondary" className="bg-slate-200 shrink-0">
                    +{selected.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
          <Command>
            <CommandInput
              placeholder="Rechercher..."
              value={search}
              onValueChange={setSearch}
              disabled={disabled}
            />
            <CommandList>
              <CommandGroup>
                {isLoading
                  ? loadingIndicator
                  : filteredOptions.length > 0
                    ? filteredOptions.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disable}
                        onSelect={() => handleSelect(item)}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            {item.imageUrl && (
                              <Image
                                src={item.imageUrl}
                                alt={item.label}
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                            )}
                            <span>{item.label}</span>
                          </div>
                          {isSelected(item) && <Check className="w-4 h-4" />}
                        </div>
                      </CommandItem>
                    ))
                    : emptyIndicator}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
