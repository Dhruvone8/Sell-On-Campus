import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({
  className,
  rounded = "xl",
  ...props
}: SkeletonProps) {
  const roundings = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-charcoal-200/60",
        roundings[rounded],
        className
      )}
      {...props}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white/80 p-3 shadow-xs space-y-3">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" rounded="xl" />
      {/* Title & Category */}
      <div className="space-y-2 p-1">
        <Skeleton className="h-4 w-2/5" rounded="md" />
        <Skeleton className="h-5 w-4/5" rounded="md" />
      </div>
      {/* Footer / User */}
      <div className="flex items-center justify-between pt-2 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" rounded="full" />
          <Skeleton className="h-4 w-20" rounded="md" />
        </div>
        <Skeleton className="h-4 w-12" rounded="md" />
      </div>
    </div>
  );
}
