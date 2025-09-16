"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { FloatingInput, FloatingLabel } from "./floating-input";

type DateRange = [Date, Date];

type DatePickerProps = {
  mode?: "single" | "multiple" | "range";
  required?: boolean;
  label: string;
  value?: Date | Date[] | { from: Date; to: Date };
  onChange?: (value: Date | Date[] | { from: Date; to: Date }) => void;
  disabled?: boolean;
  disabledRanges?: DateRange[]; // 👈 tableau de ranges [ [min, max], ... ]
  className?: string;
};

export function DatePicker({
  mode = "multiple",
  required = true,
  label,
  value,
  onChange,
  disabled,
  disabledRanges = [],
  className,
}: DatePickerProps) {
  const isSingle = mode === "single";

  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [multipleDates, setMultipleDates] = useState<Date[]>([]);
  const [rangeDates, setRangeDates] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);

  useEffect(() => {
    if (isSingle && value instanceof Date) {
      setSingleDate(value);
    } else if (mode === "multiple" && Array.isArray(value)) {
      setMultipleDates(value);
    } else if (
      mode === "range" &&
      value &&
      typeof value === "object" &&
      "from" in value &&
      "to" in value
    ) {
      setRangeDates(value as { from: Date; to: Date });
    }
  }, [value, mode, isSingle]);

  let displayValue = "";
  if (isSingle) {
    displayValue = singleDate ? format(singleDate, "PPP", { locale: fr }) : "";
  } else if (mode === "range") {
    displayValue =
      rangeDates && rangeDates.from && rangeDates.to
        ? `${format(rangeDates.from, "PPP", { locale: fr })} - ${format(
            rangeDates.to,
            "PPP",
            { locale: fr }
          )}`
        : "";
  } else {
    displayValue =
      multipleDates.length > 0
        ? multipleDates.map((d) => format(d, "PPP", { locale: fr })).join(", ")
        : "";
  }

  // 👇 fonction pour désactiver une date si elle est dans un range
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  //   const isDateDisabled = (date: Date) => {
  //   if (disabled) return true;
  //   if (!disabledRanges || disabledRanges.length === 0) return false;

  //   return disabledRanges.some(([min, max]) => {
  //     return date >= min && date <= max;
  //   });
  // };

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;
    if (!disabledRanges || disabledRanges.length === 0) return false;

    const current = normalizeDate(date);

    return disabledRanges.some(([min, max]) => {
      const start = normalizeDate(new Date(min));
      const end = normalizeDate(new Date(max));
      return current >= start && current <= end;
    });
  };

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <FloatingInput
          type="text"
          id={label.toLowerCase().replaceAll("-", "-")}
          value={displayValue}
          disabled
          required={required}
          className={className}
        />
        <FloatingLabel
          htmlFor={label.toLowerCase().replaceAll("-", "-")}
          className="!gap-x-0 text-sm !cursor-default"
        >
          <CalendarIcon className="mr-2 w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </FloatingLabel>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto">
        {isSingle ? (
          <Calendar
            mode="single"
            locale={fr}
            selected={singleDate}
            onSelect={(date) => {
              setSingleDate(date as Date);
              onChange?.(date as Date);
            }}
            disabled={isDateDisabled}
          />
        ) : mode === "range" ? (
          <Calendar
            mode="range"
            locale={fr}
            selected={rangeDates}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setRangeDates({ from: range.from, to: range.to });
                onChange?.({ from: range.from, to: range.to });
              } else {
                setRangeDates(undefined);
                onChange?.(
                  undefined as unknown as
                    | Date
                    | Date[]
                    | { from: Date; to: Date }
                );
              }
            }}
            disabled={isDateDisabled}
          />
        ) : (
          <Calendar
            mode="multiple"
            locale={fr}
            selected={multipleDates}
            onSelect={(dates) => {
              setMultipleDates(dates ?? []);
              onChange?.(dates ?? []);
            }}
            disabled={isDateDisabled}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
