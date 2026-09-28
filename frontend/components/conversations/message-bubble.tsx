"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isCurrentUser: boolean;
  className?: string;
}

export function MessageBubble({
  content,
  createdAt,
  isCurrentUser,
  className,
}: MessageBubbleProps) {
  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "";
    }
  }, [createdAt]);

  return (
    <div
      className={cn(
        "flex w-full my-1.5 animate-in fade-in-20 duration-150",
        isCurrentUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[70%] px-4 py-2.5 space-y-1 shadow-2xs transition-all",
          isCurrentUser
            ? "bg-brand-500 text-white rounded-2xl rounded-br-xs"
            : "bg-white border border-charcoal-200/80 text-charcoal-900 rounded-2xl rounded-bl-xs"
        )}
      >
        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>

        <div
          className={cn(
            "flex items-center text-[10px] font-medium justify-end",
            isCurrentUser ? "text-brand-100" : "text-charcoal-400"
          )}
        >
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
