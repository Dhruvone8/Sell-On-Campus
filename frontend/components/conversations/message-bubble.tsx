"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

export interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isCurrentUser: boolean;
  sequence?: number;
  peerLastReadSequence?: number;
  className?: string;
}

export function MessageBubble({
  content,
  createdAt,
  isCurrentUser,
  sequence,
  peerLastReadSequence,
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

  // Determine read status for outgoing messages
  const isReadByPeer =
    isCurrentUser &&
    sequence !== undefined &&
    peerLastReadSequence !== undefined &&
    sequence <= peerLastReadSequence;

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
            "flex items-center gap-1 text-[10px] font-medium justify-end",
            isCurrentUser ? "text-brand-100" : "text-charcoal-400"
          )}
        >
          <span>{formattedTime}</span>
          {isCurrentUser && sequence !== undefined && (
            isReadByPeer ? (
              <CheckCheck className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <Check className="w-3.5 h-3.5 text-brand-200/80" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

