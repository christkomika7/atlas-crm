"use client";

import { UseFormReturn } from "react-hook-form";
import { EditCompanySchemaType } from "@/lib/zod/company.schema";

interface Props {
  form: UseFormReturn<EditCompanySchemaType>;
}

export default function EditCompanyFormErrors({ form }: Props) {
  const { errors } = form.formState;

  if (!errors || Object.keys(errors).length === 0) return null;

  // Récupère toutes les erreurs plates (même imbriquées)
  const getErrorMessages = (errObj: any, parentKey = ""): string[] => {
    const messages: string[] = [];

    for (const key in errObj) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const value = errObj[key];

      if (value?.message) {
        messages.push(value.message);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item) {
            messages.push(...getErrorMessages(item, `${fullKey}[${index}]`));
          }
        });
      } else if (typeof value === "object" && value !== null) {
        messages.push(...getErrorMessages(value, fullKey));
      }
    }

    return messages;
  };

  const errorMessages = getErrorMessages(errors);

  return (
    <div className="space-y-1 bg-red-50 mt-4 p-4 border border-red-200 rounded-lg text-red-800 text-sm">
      <strong>Veuillez corriger les erreurs suivantes :</strong>
      <ul className="list-disc list-inside">
        {errorMessages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
