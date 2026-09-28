import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  };

  const variants = {
    error: "border-red-200 bg-red-50/90 text-red-900 [&>svg]:text-red-600",
    success: "border-emerald-200 bg-emerald-50/90 text-emerald-900 [&>svg]:text-emerald-600",
    warning: "border-amber-200 bg-amber-50/90 text-amber-900 [&>svg]:text-amber-600",
    info: "border-blue-200 bg-blue-50/90 text-blue-900 [&>svg]:text-blue-600",
  };

  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-xl border p-4 text-sm backdrop-blur-sm transition-all shadow-xs",
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-semibold leading-tight mb-1">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
