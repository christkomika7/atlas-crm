import { forwardRef, useEffect, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Input } from "./input";

export interface InputNumberProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // Controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number; // nombre de décimales autorisées
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      stepper,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 2, // <-- par défaut 2 décimales
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue
    );

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: {
      value: string;
      floatValue: number | undefined;
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue;
      setValue(newValue);
      if (onValueChange) onValueChange(newValue);
    };

    return (
      <div className="flex items-center w-full">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator=" "
          decimalScale={decimalScale} // autorise les floats
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="bg-gray shadow-none border-none rounded-lg focus-visible:ring-blue w-full h-11 placeholder:text-neutral-700"
          getInputRef={ref}
          isAllowed={(values) => {
            const { floatValue } = values;
            if (floatValue === undefined) return true;
            return floatValue >= min && floatValue <= max;
          }}
          {...props}
        />
      </div>
    );
  }
);
