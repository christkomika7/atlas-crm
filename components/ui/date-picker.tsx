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
import { cutText } from "@/lib/utils";

type DateRange = [Date, Date];

type DatePickerProps = {
  cut?: number;
  mode?: "single" | "multiple" | "range";
  required?: boolean;
  label: string;
  value?: Date | Date[] | { from: Date; to: Date };
  onChange?: (value: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  onOpenCalendar?: () => void;
  disabled?: boolean;
  disabledRanges?: DateRange[];
  className?: string;
};

export function DatePicker({
  mode = "multiple",
  required = true,
  label,
  value,
  onChange,
  onOpenCalendar,
  disabled,
  disabledRanges = [],
  className,
  cut,
}: DatePickerProps) {
  const isSingle = mode === "single";

  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [multipleDates, setMultipleDates] = useState<Date[]>([]);
  const [rangeDates, setRangeDates] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);

  // Sync internal state with incoming prop (controlled usage)
  useEffect(() => {
    if (value === undefined || value === null) {
      setSingleDate(undefined);
      setMultipleDates([]);
      setRangeDates(undefined);
      return;
    }

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

  let displayValue: string = "";

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

  const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;

    const current = normalizeDate(date);

    const isDisabledByRanges =
      disabledRanges &&
      disabledRanges.some(([min, max]) => {
        const start = normalizeDate(new Date(min));
        const end = normalizeDate(new Date(max));
        return current >= start && current <= end;
      });

    return isDisabledByRanges;
  };

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setRangeDates({ from: range.from, to: range.to });
      onChange?.({ from: range.from, to: range.to });
    } else {
      setRangeDates(undefined);
      onChange?.(undefined);
    }
  };


  return (
    <Popover>
      <PopoverTrigger className="relative" disabled={disabled} onClick={onOpenCalendar}>
        <FloatingInput
          type="text"
          disabled={true}
          id={label.toLowerCase().replaceAll(" ", "-")}
          value={mode === "range" && cut ? cutText(displayValue || "", cut) : displayValue || ""}
          required={required}
          className={className}
        />
        <FloatingLabel
          htmlFor={label.toLowerCase().replaceAll(" ", "-")}
          className="!gap-x-0 text-sm !cursor-default"
        >
          {label && <CalendarIcon className="mr-2 w-4 h-4" />}
          {label}
          {label && required && <span className="text-red-500">*</span>}
        </FloatingLabel>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" side="bottom" align="end">
        {isSingle ? (
          <Calendar
            mode="single"
            locale={fr}
            selected={singleDate}
            onSelect={(date) => {
              setSingleDate(date);
              onChange?.(date as Date);
            }}
            disabled={isDateDisabled}
          />
        ) : mode === "range" ? (
          <Calendar
            mode="range"
            locale={fr}
            selected={rangeDates}
            onSelect={handleRangeSelect}
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
