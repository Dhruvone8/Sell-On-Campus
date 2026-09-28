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
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-brand-500 hover:bg-brand-400 active:scale-[0.99] text-white shadow-sm hover:shadow-[0_4px_14px_0_rgba(249,90,30,0.25)] font-semibold rounded-xl",
      secondary:
        "bg-charcoal-900 hover:bg-charcoal-800 active:scale-[0.99] text-white font-semibold rounded-xl shadow-sm",
      outline:
        "border border-charcoal-200 bg-white hover:bg-charcoal-50 active:bg-charcoal-100 text-charcoal-900 rounded-xl shadow-xs",
      ghost:
        "hover:bg-charcoal-100 active:bg-charcoal-200 text-charcoal-700 hover:text-charcoal-900 rounded-xl",
      glass:
        "bg-white/80 hover:bg-white/95 backdrop-blur-md border border-white/80 text-charcoal-900 shadow-xs hover:shadow-sm rounded-xl",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm active:scale-[0.99]",
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
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
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
