"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-[560px]",
    xl: "max-w-2xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop: covers entire viewport including fixed navbar */}
      <div
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card: centered, bounded by 90dvh, flex-col with inner scroll safety */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full max-h-[90dvh] rounded-3xl bg-white border border-charcoal-200/90 shadow-2xl transition-all z-10 text-left flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200",
          maxWidths[maxWidth],
          className
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-xl p-2 text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header if title is provided */}
        {(title || description) && (
          <div className="shrink-0 p-5 sm:p-6 pb-3 border-b border-charcoal-100 pr-12">
            {title && (
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 tracking-tight font-jakarta">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-charcoal-500 leading-normal">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
}
