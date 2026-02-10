import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        placeholder=" "
        className={cn(
          "peer bg-gray disabled:opacity-100 shadow-none border-none rounded-lg focus-visible:ring-blue h-11 placeholder:text-neutral-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "top-1 peer-focus:top-1 peer-placeholder-shown:top-1/2 rtl:peer-focus:left-auto z-10 absolute bg-gray dark:bg-background px-3 peer-focus:px-2 rounded-full text-neutral-700 text-sm scale-75 peer-focus:scale-75 peer-placeholder-shown:scale-100 origin-left -translate-y-4 rtl:peer-focus:translate-x-1/4 peer-focus:-translate-y-4 peer-placeholder-shown:-translate-y-1/2 duration-300 cursor-text peer-focus:secondary peer-focus:dark:secondary start-2 transform",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingLabel.displayName = "FloatingLabel";

type FloatingLabelInputProps = InputProps & { label?: string };

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const FloatingTextareaBase = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <Textarea
      placeholder=" "
      className={cn(
        "peer bg-gray disabled:opacity-100 shadow-none p-3 border-none rounded-lg focus-visible:ring-blue w-full h-24 placeholder:text-neutral-700 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingTextareaBase.displayName = "FloatingTextareaBase";

const FloatingTextareaLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "top-2 peer-focus:top-2 peer-placeholder-shown:top-6 rtl:peer-focus:left-auto z-10 absolute bg-gray dark:bg-background px-3 peer-focus:px-2 rounded-full text-neutral-700 text-sm scale-75 peer-focus:scale-75 peer-placeholder-shown:scale-100 origin-left -translate-y-4 rtl:peer-focus:translate-x-1/4 peer-focus:-translate-y-4 peer-placeholder-shown:-translate-y-1/2 duration-300 cursor-text peer-focus:secondary peer-focus:dark:secondary start-2 transform",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingTextareaLabel.displayName = "FloatingTextareaLabel";

type FloatingTextareaProps = TextareaProps & { label?: string };

const FloatingTextarea = React.forwardRef<
  React.ElementRef<typeof FloatingTextareaBase>,
  React.PropsWithoutRef<FloatingTextareaProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingTextareaBase ref={ref} id={id} {...props} />
      <FloatingTextareaLabel htmlFor={id}>{label}</FloatingTextareaLabel>
    </div>
  );
});
FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingInput, FloatingLabel, FloatingLabelInput, FloatingTextarea };
