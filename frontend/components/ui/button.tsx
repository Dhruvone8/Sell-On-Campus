import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "glass"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-xs font-semibold rounded-xl",
      secondary:
        "bg-charcoal-900 hover:bg-charcoal-800 active:bg-charcoal-950 text-white font-semibold rounded-xl shadow-xs",
      outline:
        "border border-charcoal-200/80 bg-white hover:bg-charcoal-50 active:bg-charcoal-100 text-charcoal-900 rounded-xl shadow-2xs",
      ghost:
        "hover:bg-charcoal-100 active:bg-charcoal-200 text-charcoal-700 hover:text-charcoal-900 rounded-xl",
      glass:
        "bg-white hover:bg-charcoal-50 border border-charcoal-200/80 text-charcoal-900 shadow-2xs rounded-xl",
      destructive:
        "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl shadow-xs",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base font-semibold gap-2.5",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0 stroke-[1.5]" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
