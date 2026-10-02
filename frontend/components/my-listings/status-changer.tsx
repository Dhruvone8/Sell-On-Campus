"use client";

import * as React from "react";
import { ListingStatus } from "@/lib/types";
import { Loader2, CheckCircle2, Bookmark, Check, ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";

export interface StatusChangerProps {
  listingId: string;
  currentStatus: ListingStatus;
  onStatusChange?: (newStatus: ListingStatus) => void;
  className?: string;
}

const STATUS_METADATA: Record<
  ListingStatus,
  {
    label: string;
    badgeBg: string;
    dotColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    badgeBg: "bg-emerald-50",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  RESERVED: {
    label: "Reserved",
    badgeBg: "bg-amber-50",
    dotColor: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  SOLD: {
    label: "Sold",
    badgeBg: "bg-charcoal-100",
    dotColor: "bg-charcoal-400",
    textColor: "text-charcoal-600 line-through",
    borderColor: "border-charcoal-200",
  },
};

export function StatusChanger({
  listingId,
  currentStatus,
  onStatusChange,
  className,
}: StatusChangerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState<ListingStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentMeta = STATUS_METADATA[currentStatus] || STATUS_METADATA.ACTIVE;

  // Compute available target transitions based on backend rules:
  // ACTIVE -> RESERVED
  // RESERVED -> ACTIVE or SOLD
  // SOLD -> None (terminal)
  const availableTransitions: {
    status: ListingStatus;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
  }[] = [];

  if (currentStatus === "ACTIVE") {
    availableTransitions.push({
      status: "RESERVED",
      label: "Mark as Reserved",
      description: "Hold item for a prospective buyer",
      icon: Bookmark,
      colorClass: "text-amber-600 hover:bg-amber-50",
    });
  } else if (currentStatus === "RESERVED") {
    availableTransitions.push(
      {
        status: "ACTIVE",
        label: "Mark as Active",
        description: "Make item available to all buyers again",
        icon: CheckCircle2,
        colorClass: "text-emerald-600 hover:bg-emerald-50",
      },
      {
        status: "SOLD",
        label: "Mark as Sold",
        description: "Deal completed! Finalize listing",
        icon: Check,
        colorClass: "text-charcoal-700 hover:bg-charcoal-50",
      }
    );
  }

  const handleSelectStatus = async (newStatus: ListingStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    try {
      setIsUpdating(true);
      setUpdatingStatus(newStatus);
      setError(null);
      const apiUrl = API_URL;

      const res = await fetch(`${apiUrl}/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      onStatusChange?.(newStatus);
      setIsOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error updating status";
      setError(errMsg);
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  // If status is SOLD, no further transitions are allowed
  if (currentStatus === "SOLD") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border select-none",
            currentMeta.badgeBg,
            currentMeta.textColor,
            currentMeta.borderColor
          )}
        >
          <Lock className="w-3 h-3 text-charcoal-400" />
          <span>Sold</span>
        </span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs",
          currentMeta.badgeBg,
          currentMeta.textColor,
          currentMeta.borderColor,
          "focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:scale-[0.98]",
          isUpdating && "opacity-70 cursor-wait"
        )}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className={cn("w-2 h-2 rounded-full shrink-0", currentMeta.dotColor)} />
        )}
        <span>{currentMeta.label}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-charcoal-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-white shadow-xl border border-charcoal-200/80 py-1.5 z-40 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-charcoal-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
              Update Listing Status
            </p>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Current: <strong className="text-charcoal-900">{currentMeta.label}</strong>
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            {availableTransitions.map((option) => {
              const Icon = option.icon;
              const isOptionUpdating = isUpdating && updatingStatus === option.status;
              return (
                <button
                  key={option.status}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleSelectStatus(option.status)}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer group",
                    option.colorClass,
                    isUpdating && "disabled:opacity-60 disabled:cursor-wait"
                  )}
                >
                  {isOptionUpdating ? (
                    <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-brand-500" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-charcoal-900 group-hover:text-charcoal-950 flex items-center gap-1.5">
                      <span>{option.label}</span>
                      {isOptionUpdating && (
                        <span className="text-[10px] text-brand-600 font-medium animate-pulse">
                          Updating...
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-charcoal-500 line-clamp-1">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-50 border-t border-red-100 text-red-600 text-xs">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
