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
  className,
}: MessagePanelProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingMessages]);

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
            {messages.map((msg) => {
              // Current user if sender matches currentUserId OR sender is NOT otherUser.id
              const isCurrentUser = currentUserId
                ? msg.senderId === currentUserId
                : msg.senderId !== conversation.otherUser.id;

              return (
                <MessageBubble
                  key={msg.id}
                  content={msg.content}
                  createdAt={msg.createdAt}
                  isCurrentUser={isCurrentUser}
                />
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
