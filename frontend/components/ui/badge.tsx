import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "brand"
    | "success"
    | "warning"
    | "sold"
    | "category"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants = {
    default: "bg-charcoal-100 text-charcoal-700 border border-charcoal-200",
    brand: "bg-brand-50 text-brand-600 border border-brand-200 font-semibold",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold",
    sold: "bg-charcoal-100 text-charcoal-500 border border-charcoal-200 line-through",
    category: "bg-white/90 text-charcoal-700 border border-charcoal-200 shadow-xs hover:border-charcoal-300",
    outline: "bg-transparent text-charcoal-600 border border-charcoal-200",
  };

  const dotColors = {
    default: "bg-charcoal-400",
    brand: "bg-brand-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    sold: "bg-charcoal-400",
    category: "bg-charcoal-400",
    outline: "bg-charcoal-400",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
