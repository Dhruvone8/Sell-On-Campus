import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-charcoal-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full rounded-xl bg-white/90 border border-charcoal-200 px-3.5 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-all duration-200",
              "focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus-visible:ring-2 focus-visible:ring-brand-500/30",
              "disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:text-charcoal-400",
              Boolean(leftIcon) && "pl-10",
              Boolean(rightIcon) && "pr-10",
              Boolean(error) && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-charcoal-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
