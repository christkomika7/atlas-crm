// components/ui/text-field.tsx
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import TextInput from "@/components/ui/text-input";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface TextFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    type?: "text" | "number";
    design?: "float" | "text-area";
    required?: boolean;
}

export function TextField<T extends FieldValues>({
    control,
    name,
    label,
    type = "text",
    design = "float",
    required = true,
}: TextFieldProps<T>) {

    if (!name) {
        console.error("TextField: name is undefined for label:", label);
        return null;
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="-space-y-2">
                    <FormControl>
                        <TextInput
                            type={type}
                            design={design}
                            label={label}
                            value={field.value as string}
                            handleChange={(e) => field.onChange(type === "number" ? String(e) : e)}
                            required={required}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}