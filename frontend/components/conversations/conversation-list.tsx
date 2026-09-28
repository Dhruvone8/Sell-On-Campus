"use client";

import * as React from "react";
import { ConversationItem, ConversationItemData } from "./conversation-item";
import { Search, MessageSquare, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ConversationListProps {
  conversations: ConversationItemData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUser.name.toLowerCase().includes(q) ||
        c.listing.title.toLowerCase().includes(q) ||
        c.lastMessage?.content.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-charcoal-200/80",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-charcoal-100 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-500">
              <MessageSquare className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-charcoal-900 font-jakarta">
              Messages
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-charcoal-100 text-charcoal-700 font-mono">
            {conversations.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student or item..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200/80 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
          />
        </div>
      </div>

      {/* Conversation List Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-3 p-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-charcoal-100 flex items-start gap-3 animate-pulse"
              >
                <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onSelect={() => onSelect(conv.id)}
            />
          ))
        ) : (
          /* Empty state */
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto text-charcoal-400">
              <Sparkles className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs font-bold text-charcoal-700">
              {searchQuery
                ? "No matching conversations"
                : "No conversations yet"}
            </p>
            <p className="text-[11px] text-charcoal-500 leading-relaxed max-w-[220px] mx-auto">
              {searchQuery
                ? `No conversations match "${searchQuery}".`
                : "When you inquire about items or sellers message you, active chats appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
