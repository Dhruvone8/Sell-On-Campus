"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare, Bell, Check, Clock } from "lucide-react";
import { formatRelativeTime, cn } from "@/lib/utils";

export interface NotificationData {
  id: string;
  message: string;
  isRead: boolean;
  conversationId?: string | null;
  createdAt: string;
}

export interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead?: (id: string) => void;
  onNavigate?: () => void;
  compact?: boolean;
  className?: string;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
  compact = false,
  className,
}: NotificationItemProps) {
  const { id, message, isRead, conversationId, createdAt } = notification;

  const isMessageNotif = message.toLowerCase().includes("message");
  const targetHref = conversationId ? `/conversations?id=${conversationId}` : "/conversations";

  const handleContainerClick = () => {
    if (!isRead && onMarkRead) {
      onMarkRead(id);
    }
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isRead && onMarkRead) {
      onMarkRead(id);
    }
  };

  const content = (
    <div
      onClick={handleContainerClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl transition-all duration-200 cursor-pointer border select-none",
        compact ? "p-3" : "p-4",
        !isRead
          ? "bg-brand-50/40 border-brand-200/80 hover:bg-brand-50/70 shadow-2xs"
          : "bg-white border-charcoal-200/60 hover:bg-charcoal-50 hover:border-charcoal-300/80",
        className
      )}
    >
      {/* Icon Pill */}
      <div
        className={cn(
          "shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
          compact ? "w-9 h-9" : "w-10 h-10",
          !isRead
            ? "bg-brand-500 text-white shadow-xs shadow-brand-500/25"
            : "bg-charcoal-100 text-charcoal-600 group-hover:bg-charcoal-200"
        )}
      >
        {isMessageNotif ? (
          <MessageSquare className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
        ) : (
          <Bell className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
        )}
      </div>

      {/* Text & Time Body */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-xs sm:text-sm text-charcoal-900 leading-snug line-clamp-2",
              !isRead ? "font-bold text-charcoal-950" : "font-medium text-charcoal-700"
            )}
          >
            {message}
          </p>

          {!isRead && (
            <span
              className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1 ring-2 ring-white animate-pulse"
              title="Unread notification"
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-charcoal-400">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(createdAt)}
          </span>

          {conversationId && (
            <>
              <span>•</span>
              <span className="text-brand-600 font-semibold group-hover:underline">
                View Chat
              </span>
            </>
          )}
        </div>
      </div>

      {/* Mark As Read Button */}
      {!isRead && onMarkRead && (
        <button
          type="button"
          onClick={handleMarkReadClick}
          aria-label="Mark notification as read"
          title="Mark as read"
          className="shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-xl text-charcoal-400 hover:text-brand-600 hover:bg-brand-100/60 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (conversationId) {
    return (
      <Link href={targetHref} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
