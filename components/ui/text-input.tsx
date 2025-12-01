"use client";

import { Input } from "./input";
import {
  FloatingInput,
  FloatingLabel,
  FloatingTextarea,
} from "./floating-input";
import { cn, cutText } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { InputNumber } from "./input-number";

type TextInputProps = {
  type?: "text" | "password" | "email" | "time" | "file" | "number" | "search";
  design?: "default" | "float" | "text-area";
  multiple?: boolean;
  height?: string;
  label?: string;
  placeholder?: string;
  icon?: React.JSX.Element;
  value?: string | number | Date | File | File[];
  inputRef?: React.RefObject<HTMLInputElement | null>;
  handleChange: (val: string | number | File | File[]) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  accept?: string;
  showFileData?: boolean;
  min?: number;
  max?: number;
};

export default function TextInput({
  placeholder,
  label = "",
  type = "text",
  design = "default",
  icon,
  height,
  value = "",
  handleChange,
  disabled = false,
  required = true,
  multiple,
  className = "",
  accept = "",
  showFileData = false,
  inputRef,
  min,
  max,
}: TextInputProps) {
  const id = label.replaceAll(" ", "-");
  const [data, setData] = useState<File[]>([]);

  useEffect(() => {
    if (!value) setData([]);
    if (value instanceof File) return setData([value]);
    if (Array.isArray(value)) return setData(value);
    setData([]);
  }, [value]);

  const removeFile = (value: string) => {
    const currentData = data.filter((v) => v.name !== value);
    setData(currentData);
    handleChange(multiple ? currentData : currentData[0]);
  };

  const getInputValue = () => {
    if (type === "file") return undefined;
    if (value === undefined || value === null) return "";
    if (value instanceof Date)
      return type === "time"
        ? value.toTimeString().slice(0, 5)
        : value.toISOString().slice(0, 16);
    return String(value);
  };

  return (
    <div className={cn("relative", height)}>
      {design === "default" && (
        <>
          {icon && (
            <div className="absolute flex items-center p-3.5 rounded-lg w-full h-full pointer-events-none">
              <span className="flex w-4 h-4">{icon}</span>
            </div>
          )}

          {type === "number" ? (
            <InputNumber
              value={
                typeof value === "number" ? value : Number(value || 0)
              }
              min={min}
              max={max}
              onValueChange={(val) => handleChange(val || 0)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "bg-gray shadow-none border-none rounded-lg focus-visible:ring-blue h-11 placeholder:text-neutral-700",
                icon && "pl-9",
                className
              )}
            />
          ) : (
            <Input
              ref={inputRef}
              type={type}
              value={getInputValue()}
              multiple={multiple}
              onChange={(e) => {
                if (type === "file") {
                  const files = e.target.files;
                  if (!files) return;
                  handleChange(multiple ? Array.from(files) : files[0]);
                } else {
                  const val = e.target.value;
                  handleChange(val);
                }
              }}
              accept={accept}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={cn(
                "bg-gray shadow-none border-none rounded-lg focus-visible:ring-blue h-11 placeholder:text-neutral-700",
                icon && "pl-9",
                className
              )}
            />
          )}

          {type === "file" && showFileData && data.length > 0 && (
            <ul className="bg-gray-50 mt-1 p-2 rounded-lg text-gray-600 text-sm">
              {data.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center gap-x-2"
                >
                  {cutText(file.name, 50)}.{file.name.split(".").pop()}
                  <span
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                  >
                    <XIcon className="w-3.5 h-3.5 text-red" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {design === "float" && (
        <>
          {type === "number" ? (
            <InputNumber
              value={
                typeof value === "number" ? value : Number(value || 0)
              }
              onValueChange={(val) => handleChange(val || 0)}
              placeholder=" "
              min={min}
              max={max}
              disabled={disabled}
              className={cn(
                "peer bg-gray shadow-none border-none rounded-lg focus-visible:ring-blue h-11 placeholder:text-neutral-700",
                className
              )}
            />
          ) : (
            <FloatingInput
              id={id}
              ref={inputRef}
              type={type}
              multiple={multiple}
              value={getInputValue()}
              accept={accept}
              disabled={disabled}
              onChange={(e) => {
                if (type === "file") {
                  const files = e.target.files;
                  if (!files) return;
                  handleChange(multiple ? Array.from(files) : files[0]);
                } else {
                  const val = e.target.value;
                  handleChange(val);
                }
              }}
              required={required}
              className={className}
            />
          )}
          <FloatingLabel htmlFor={id}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FloatingLabel>

          {type === "file" && showFileData && data.length > 0 && (
            <ul className="bg-gray-50 mt-1 p-2 rounded-lg text-gray-600 text-sm">
              {data.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center gap-x-2"
                >
                  {cutText(file.name, 50)}.{file.name.split(".").pop()}
                  <span
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                  >
                    <XIcon className="w-3.5 h-3.5 text-red" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {design === "text-area" && (
        <>
          <FloatingTextarea
            id={id}
            value={getInputValue()}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value)}
            required={required}
            className={className}
          />
          <FloatingLabel htmlFor={id}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </FloatingLabel>
        </>
      )}
    </div>
  );
}
