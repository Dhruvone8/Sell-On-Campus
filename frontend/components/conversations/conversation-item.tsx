/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { formatPrice, formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { Tag } from "lucide-react";

export type ConversationItemData = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: string | number;
    status: string;
  };
  otherUser: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    sequence: number;
    createdAt: string;
  } | null;
  unreadCount: number;
};

export interface ConversationItemProps {
  conversation: ConversationItemData;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  className,
}: ConversationItemProps) {
  const { otherUser, listing, lastMessage, unreadCount } = conversation;
  const initials = getInitials(otherUser.name || "Student");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex items-start gap-3 relative border select-none group",
        isSelected
          ? "bg-brand-50/70 border-brand-300/80 shadow-xs"
          : "bg-white border-charcoal-200/60 hover:bg-charcoal-50/80 hover:border-charcoal-300/80",
        unreadCount > 0 && !isSelected && "border-l-4 border-l-brand-500",
        className
      )}
    >
      {/* Avatar Box */}
      <div className="relative shrink-0 mt-0.5">
        {otherUser.profileImageUrl ? (
          <img
            src={otherUser.profileImageUrl}
            alt={otherUser.name}
            className="w-11 h-11 rounded-xl object-cover ring-1 ring-charcoal-200"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200/70 flex items-center justify-center text-brand-600 font-bold text-sm font-jakarta">
            {initials}
          </div>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" />
        )}
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Top: Name & Time */}
        <div className="flex items-center justify-between gap-1.5">
          <h4
            className={cn(
              "text-xs font-bold text-charcoal-900 truncate font-jakarta group-hover:text-brand-600 transition-colors",
              unreadCount > 0 && "font-black text-charcoal-950"
            )}
          >
            {otherUser.name}
          </h4>
          {lastMessage?.createdAt && (
            <span className="text-[10px] text-charcoal-400 font-medium shrink-0">
              {formatRelativeTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Middle: Item context badge & price */}
        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-600">
          <span className="inline-flex items-center gap-1 font-semibold text-brand-700 bg-brand-50/80 border border-brand-200/60 px-1.5 py-0.5 rounded-md truncate max-w-[170px]">
            <Tag className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{listing.title}</span>
          </span>
          <span className="font-extrabold text-charcoal-800 shrink-0 font-jakarta">
            {formatPrice(listing.price)}
          </span>
        </div>

        {/* Bottom: Message snippet & unread pill */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              unreadCount > 0
                ? "font-semibold text-charcoal-900"
                : "text-charcoal-500 font-normal"
            )}
          >
            {lastMessage ? lastMessage.content : "Start the conversation..."}
          </p>

          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shrink-0 shadow-2xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
