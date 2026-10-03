"use client";

import * as React from "react";
import { ConversationItemData } from "./conversation-item";
import { ListingContextHeader } from "./listing-context-header";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageData = {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  sequence: number;
  createdAt: string;
};

/** Format a date into a WhatsApp-style day label: Today, Yesterday, or "3 Oct 2026" */
function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Get a YYYY-MM-DD string for grouping */
function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface MessagePanelProps {
  conversation: ConversationItemData | null;
  messages: MessageData[];
  currentUserId: string | null;
  isLoadingMessages: boolean;
  isSending: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onBack?: () => void;
  error?: string | null;
  isConnected?: boolean;
  peerLastReadSequence?: number;
  initialUserLastReadSequence?: number;
  className?: string;
}

export function MessagePanel({
  conversation,
  messages,
  currentUserId,
  isLoadingMessages,
  isSending,
  onSendMessage,
  onBack,
  error,
  isConnected,
  peerLastReadSequence,
  initialUserLastReadSequence,
  className,
}: MessagePanelProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingMessages]);

  // Find the index of the first unread incoming message for the divider
  const unreadDividerIndex = React.useMemo(() => {
    if (initialUserLastReadSequence === undefined || initialUserLastReadSequence === null) return -1;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isIncoming = currentUserId
        ? msg.senderId !== currentUserId
        : msg.senderId === conversation?.otherUser.id;
      if (isIncoming && msg.sequence > initialUserLastReadSequence) {
        return i;
      }
    }
    return -1;
  }, [messages, initialUserLastReadSequence, currentUserId, conversation?.otherUser.id]);

  if (!conversation) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center p-8 bg-canvas text-center space-y-4",
          className
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-white border border-charcoal-200/80 flex items-center justify-center text-charcoal-400 shadow-xs">
          <MessageSquare className="w-8 h-8 opacity-60 text-brand-500" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-bold text-charcoal-900 font-jakarta">
            No Conversation Selected
          </h3>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            Select a conversation from the left inbox sidebar to review messages or discuss price and meetup details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full bg-canvas overflow-hidden",
        className
      )}
    >
      {/* 1. Top Context Bar */}
      <ListingContextHeader
        otherUser={conversation.otherUser}
        listing={conversation.listing}
        isConnected={isConnected}
        onBack={onBack}
      />

      {/* 2. Message History Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 scrollbar-thin">
        {error && (
          <div className="p-3 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoadingMessages ? (
          <div className="h-full flex flex-col items-center justify-center text-charcoal-400 py-16">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mb-2" />
            <p className="text-xs font-medium text-charcoal-500">
              Loading chat messages...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
            <p className="text-xs font-bold text-charcoal-700">
              No messages in this chat yet
            </p>
            <p className="text-[11px] text-charcoal-500 max-w-xs">
              Send a message below or pick a quick suggestion to discuss availability, price, and campus handoff.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              // Current user if sender matches currentUserId OR sender is NOT otherUser.id
              const isCurrentUser = currentUserId
                ? msg.senderId === currentUserId
                : msg.senderId !== conversation.otherUser.id;

              // Show unread divider before the first unread incoming message
              const showUnreadDivider = index === unreadDividerIndex;

              // Date separator: show when the day changes from the previous message
              const currentDateKey = toDateKey(msg.createdAt);
              const prevDateKey = index > 0 ? toDateKey(messages[index - 1].createdAt) : null;
              const showDateSeparator = index === 0 || currentDateKey !== prevDateKey;

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4 select-none">
                      <span className="text-[10px] font-semibold text-charcoal-500 bg-charcoal-100/80 border border-charcoal-200/60 px-3 py-1 rounded-full shadow-2xs">
                        {formatDateLabel(new Date(msg.createdAt))}
                      </span>
                    </div>
                  )}
                  {showUnreadDivider && (
                    <div className="flex items-center gap-3 my-3 select-none">
                      <div className="flex-1 h-px bg-brand-300/60" />
                      <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider px-2">
                        Unread Messages
                      </span>
                      <div className="flex-1 h-px bg-brand-300/60" />
                    </div>
                  )}
                  <MessageBubble
                    content={msg.content}
                    createdAt={msg.createdAt}
                    isCurrentUser={isCurrentUser}
                    sequence={msg.sequence}
                    peerLastReadSequence={peerLastReadSequence}
                  />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 3. Bottom Composer Bar */}
      <MessageInput
        onSendMessage={onSendMessage}
        isSending={isSending}
        disabled={isLoadingMessages}
      />
    </div>
  );
}
