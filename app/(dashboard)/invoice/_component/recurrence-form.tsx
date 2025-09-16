"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function RecurrenceForm() {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  function reset() {
    setDate(undefined);
  }

  function validate() {
    console.log(date);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Calendar
        mode="range"
        selected={date}
        onSelect={setDate}
        className="border rounded-lg w-full"
      />
      <div className="flex justify-center gap-x-4 w-full">
        <Button onClick={reset} variant="primary" className="bg-gray text-dark">
          Reinitialiser
        </Button>
        <Button onClick={validate} variant="primary">
          Valider
        </Button>
      </div>
    </div>
  );
}
