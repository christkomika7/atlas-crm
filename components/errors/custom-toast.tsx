import { toast } from "sonner";

type FieldErrors = Record<string, string[]>;

export function showErrorToast(title: string, fieldErrors: FieldErrors) {
  const errorItems = Object.entries(fieldErrors).map(([field, messages]) => (
    <li key={field} className="ml-4 list-disc">
      <strong>{field}</strong>: {messages.join(", ")}
    </li>
  ));

  toast(
    <div className="p-4">
      <h4 className="mb-2 font-semibold">{title}</h4>
      <ul className="text-red-600 text-sm">{errorItems}</ul>
    </div>
  );
}
