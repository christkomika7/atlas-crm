import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, cutText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Calendar = ({
  params = [],
}: {
  params?: Array<{
    id: string;
    company: string;
    client: string;
    startDate?: string;
    endDate?: string;
  }>;
}) => {
  console.log({ params })
  const [year, setYear] = useState(new Date().getFullYear());
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const toUtcMidnight = (dateString: string) => {
    const datePart = dateString.split("T")[0]; // "YYYY-MM-DD"
    const [y, m, d] = datePart.split("-").map((v) => Number(v));
    // Date.UTC(year, monthIndex, day) -> timestamp à 00:00:00 UTC
    return Date.UTC(y, m - 1, d);
  };


  // Fonction pour vérifier si une date est comprise dans un intervalle
  const isDateInRange = (
    targetDateIso: string, // ex: "2025-10-15"
    startDateString?: string,
    endDateString?: string
  ) => {
    if (!startDateString || !endDateString) return false;

    const target = normalizeDateOnly(targetDateIso);
    const start = normalizeDateOnly(startDateString);
    const end = normalizeDateOnly(endDateString);

    // debug utile pour repérer l'origine du décalage
    // supprime ou commente ces logs en production
    console.debug("isDateInRange:", { target, start, end, result: target >= start && target <= end });

    return target >= start && target <= end;
  };

  const normalizeDateOnly = (raw?: string) => {
    if (!raw) return "";
    // extrait les 10 premiers caractères si match YYYY-MM-DD... sinon on tente split
    const trimmed = raw.trim();
    const iso = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/.exec(trimmed);
    if (iso) return iso[0];
    // fallback (évitez d'arriver ici si possible)
    return trimmed.split("T")[0] || trimmed;
  };

  // Fonction pour obtenir les données d'un jour spécifique
  const getDayData = (day: number, month: number, year: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`; // exemple "2025-10-15"

    return params.filter((param) => {
      if (param.startDate && param.endDate) {
        console.log({ start: param.startDate, end: param.endDate });
        console.log({ date: isDateInRange(dateKey, param.startDate, param.endDate) })
        return isDateInRange(dateKey, param.startDate, param.endDate);
      }
      return param.id === dateKey;
    });
  };

  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Ajustement pour commencer par lundi (0=Lun, 6=Dim)

    // Dates du mois précédent
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    const daysArray: {
      day: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      month: number;
      year: number;
    }[] = [];

    // Ajouter les derniers jours du mois précédent
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dayOfWeek = (startDayOfWeek - 1 - i) % 7;
      daysArray.push({
        day,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Samedi (5) et Dimanche (6)
        month: prevMonth,
        year: prevYear,
      });
    }

    // Ajouter tous les jours du mois courant
    for (let d = 1; d <= lastDay; d++) {
      const dayOfWeek = (startDayOfWeek + d - 1) % 7;
      daysArray.push({
        day: d,
        isCurrentMonth: true,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Samedi (5) et Dimanche (6)
        month: month,
        year: year,
      });
    }

    // Compléter pour avoir exactement 6 semaines (42 jours)
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    let nextMonthDay = 1;
    while (daysArray.length < 42) {
      const dayOfWeek = daysArray.length % 7;
      daysArray.push({
        day: nextMonthDay,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Samedi (5) et Dimanche (6)
        month: nextMonth,
        year: nextYear,
      });
      nextMonthDay++;
    }

    return daysArray;
  };

  // Fonction pour formater le contenu du tooltip
  const formatTooltipContent = (
    dayDataInfo: Array<{
      id: string;
      company: string;
      client: string;
      startDate?: string;
      endDate?: string;
    }>
  ) => {
    if (dayDataInfo.length === 0) return null;

    return (
      <>
        {dayDataInfo.map((event, index) => (
          <div key={index} className="space-y-2">
            <div className="font-semibold text-sm">Événement {event.id}</div>
            <div className="text-xs">
              <div className="font-medium">
                <span className="font-semibold">Entreprise:</span>{" "}
                {event.company}
              </div>
              <div className="font-medium">
                <span className="font-semibold">Client:</span> {event.client}
              </div>
              {event.startDate && event.endDate && (
                <div className="text-gray-300">
                  Du {new Date(event.startDate).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(event.endDate).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="p-4">
      {/* Header avec navigation année */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <Button
          variant="outline"
          onClick={() => setYear(year - 1)}
          className="rounded !w-8 !h-8"
        >
          <ChevronLeft size={20} />
        </Button>
        <span className="font-semibold text-lg">{year}</span>
        <Button
          variant="outline"
          onClick={() => setYear(year + 1)}
          className="rounded !w-8 !h-8"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      {/* Grille de tous les mois */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        {months.map((monthName, monthIndex) => (
          <div key={monthName} className="bg-white">
            <h2 className="mb-2 font-semibold text-black text-sm text-center">
              {monthName} {year}
            </h2>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 mb-2">
              {days.map((day) => (
                <div
                  key={day}
                  className="font-semibold text-black text-xs text-center"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des dates avec CSS Grid */}
            <div className="grid grid-cols-7 border border-neutral-200">
              {getDaysInMonth(monthIndex, year).map((dayData, idx) => {
                const {
                  day,
                  isCurrentMonth,
                  isWeekend,
                  year: dayYear,
                } = dayData;
                const dayDataInfo = isCurrentMonth
                  ? getDayData(day, monthIndex, dayYear)
                  : [];

                const dayCell = (
                  <div
                    key={idx}
                    className={`
                      relative flex flex-col w-full h-[58px] text-sm 
                      cursor-pointer transition-colors
                      ${isWeekend ? "bg-neutral-50" : "bg-white"}
                      ${isCurrentMonth
                        ? "hover:bg-blue-500 hover:text-white"
                        : ""
                      }
                      ${!isCurrentMonth ? "text-neutral-400" : "text-black"}
                      ${idx % 7 !== 0 ? "border-l border-neutral-200" : ""}
                      ${idx >= 7 ? "border-t border-neutral-200" : ""}
                    `}
                  >
                    {/* Cercles rouges et numéro du jour */}
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2",
                        dayDataInfo.length > 0
                          ? "justify-between"
                          : "justify-end"
                      )}
                    >
                      {dayDataInfo.length > 0 && (
                        <div className="flex gap-1">
                          {dayDataInfo.slice(0, 2).map((data, i) => (
                            <div
                              key={i}
                              className="bg-red-500 rounded-full w-3 h-3"
                            ></div>
                          ))}
                          {dayDataInfo.length > 2 && (
                            <div className="flex justify-center items-center bg-red-500 rounded-full w-3 h-3">
                              <span className="text-white text-xs">+</span>
                            </div>
                          )}
                        </div>
                      )}
                      <span className="-top-[1px] relative font-medium">
                        {day}
                      </span>
                    </div>

                    {/* Titre en bas - affiche le premier élément ou le nombre d'événements */}
                    {dayDataInfo.length > 0 && (
                      <div className="bottom-1 absolute px-1 w-full text-xs text-center truncate">
                        <span className="flex justify-center items-center bg-red-50 py-1 rounded-sm text-red-700 text-xs">
                          {cutText(
                            dayDataInfo.length === 1
                              ? dayDataInfo[0].company
                              : `${dayDataInfo.length} événements`,
                            5
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );

                // Si la case a des événements, l'entourer d'un tooltip
                if (dayDataInfo.length > 0) {
                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>{dayCell}</TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {formatTooltipContent(dayDataInfo)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // Sinon, retourner la case normale
                return dayCell;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
