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
  disabledRanges?: DateRange[];
  by?: number; // Nouveau paramètre pour définir l'intervalle (uniquement pour mode "range")
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
  by,
  className,
}: DatePickerProps) {
  const isSingle = mode === "single";

  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);
  const [multipleDates, setMultipleDates] = useState<Date[]>([]);
  const [rangeDates, setRangeDates] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [rangeStartDate, setRangeStartDate] = useState<Date | undefined>(undefined);

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

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;

    const current = normalizeDate(date);

    // Vérifier d'abord les disabledRanges existants
    const isDisabledByRanges = disabledRanges && disabledRanges.length > 0 &&
      disabledRanges.some(([min, max]) => {
        const start = normalizeDate(new Date(min));
        const end = normalizeDate(new Date(max));
        return current >= start && current <= end;
      });

    if (isDisabledByRanges) return true;

    // Appliquer la logique du paramètre "by" uniquement en mode range
    if (mode === "range" && by && rangeStartDate) {
      const startNormalized = normalizeDate(rangeStartDate);
      const daysDiff = Math.floor((current.getTime() - startNormalized.getTime()) / (1000 * 60 * 60 * 24));

      // Si la date est après la date de début
      if (daysDiff > 0) {
        // La date est valide si elle est exactement à un multiple de "by" jours
        // ou si c'est une date de début potentielle (multiple de by)
        return daysDiff % by !== 0;
      }
    }

    return false;
  };

  // Fonction pour vérifier si une date peut être sélectionnée comme date de début en mode range avec "by"
  const canBeRangeStart = (date: Date) => {
    if (mode !== "range" || !by) return true;

    // Une date peut être date de début si elle n'est pas désactivée par disabledRanges
    const current = normalizeDate(date);
    const isDisabledByRanges = disabledRanges && disabledRanges.length > 0 &&
      disabledRanges.some(([min, max]) => {
        const start = normalizeDate(new Date(min));
        const end = normalizeDate(new Date(max));
        return current >= start && current <= end;
      });

    return !isDisabledByRanges && !disabled;
  };

  // Gestionnaire personnalisé pour la sélection en mode range avec "by"
  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (mode === "range" && by) {
      // Si on sélectionne une première date
      if (range?.from && !range?.to) {
        setRangeStartDate(range.from);
        setRangeDates(undefined);
      }
      // Si on sélectionne la deuxième date (range complet)
      else if (range?.from && range?.to) {
        setRangeDates({ from: range.from, to: range.to });
        setRangeStartDate(undefined);
        onChange?.({ from: range.from, to: range.to });
      }
      // Si on déselectionne
      else {
        setRangeDates(undefined);
        setRangeStartDate(undefined);
        onChange?.(
          undefined as unknown as
          | Date
          | Date[]
          | { from: Date; to: Date }
        );
      }
    } else {
      // Comportement normal sans "by"
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
    }
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
              setSingleDate(date as Date);
              onChange?.(date as Date);
            }}
            disabled={isDateDisabled}
          />
        ) : mode === "range" ? (
          <Calendar
            mode="range"
            locale={fr}
            selected={rangeDates || (rangeStartDate ? { from: rangeStartDate } : undefined)}
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