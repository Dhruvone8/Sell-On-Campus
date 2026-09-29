import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-charcoal-200/90 bg-white/50 backdrop-blur-sm",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 shadow-xs ring-1 ring-brand-100">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-charcoal-500 leading-normal">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
