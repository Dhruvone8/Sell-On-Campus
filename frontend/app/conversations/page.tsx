"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSocket } from "@/lib/socket-context";
import {
  ConversationItemData,
} from "@/components/conversations/conversation-item";
import { ConversationList } from "@/components/conversations/conversation-list";
import {
  MessagePanel,
  MessageData,
} from "@/components/conversations/message-panel";
import { Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

function ConversationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkedConversationId = searchParams.get("conversationId") || searchParams.get("id");

  const { isAuthenticated, isLoading: isAuthLoading, setUnreadMessagesCount } = useAuth();
  const { isConnected, subscribe } = useSocket();

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [conversations, setConversations] = React.useState<ConversationItemData[]>(
    []
  );
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    string | null
  >(null);
  const [messages, setMessages] = React.useState<MessageData[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const conversationsRef = React.useRef<ConversationItemData[]>(conversations);
  React.useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // 1. Fetch current user profile to determine currentUserId
  React.useEffect(() => {
    let isMounted = true;

    async function fetchMe() {
      await Promise.resolve();
      if (!isMounted || !isAuthenticated) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.user?.id) {
            setCurrentUserId(data.user.id);
          }
        }
      } catch {
        // Non-critical: bubble alignment falls back to comparing with otherUser.id
      }
    }

    if (!isAuthLoading && isAuthenticated) {
      fetchMe();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated]);

  // 2. Fetch conversations list
  const fetchConversations = React.useCallback(async () => {
    try {
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/conversations?limit=50`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("You must be logged in to access messages.");
          return;
        }
        throw new Error("Failed to load conversations");
      }

      const data = await res.json();
      let list: ConversationItemData[] = Array.isArray(data.conversations)
        ? data.conversations
        : [];

      // If deep linked ID is provided and not in the first page, paginate to locate it
      if (
        deepLinkedConversationId &&
        !list.some((c) => c.id === deepLinkedConversationId)
      ) {
        let nextCursor = data.pagination?.nextCursor;
        let hasMore = Boolean(data.pagination?.hasMore);

        while (
          hasMore &&
          nextCursor &&
          !list.some((c) => c.id === deepLinkedConversationId)
        ) {
          const nextRes = await fetch(
            `${apiUrl}/api/conversations?limit=50&cursor=${encodeURIComponent(nextCursor)}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (!nextRes.ok) break;
          const nextData = await nextRes.json();
          const nextList: ConversationItemData[] = Array.isArray(nextData.conversations)
            ? nextData.conversations
            : [];
          list = [...list, ...nextList];
          nextCursor = nextData.pagination?.nextCursor;
          hasMore = Boolean(nextData.pagination?.hasMore);
        }
      }

      setConversations(list);

      // Handle deep linking or auto-select first conversation on desktop
      const isDeepLinkValid = Boolean(
        deepLinkedConversationId && list.some((c) => c.id === deepLinkedConversationId)
      );

      if (isDeepLinkValid) {
        setSelectedConversationId(deepLinkedConversationId);
      } else if (list.length > 0 && window.innerWidth >= 768) {
        setSelectedConversationId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0].id));
      } else {
        setSelectedConversationId((prev) => (prev && list.some((c) => c.id === prev) ? prev : null));
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error loading chats";
      setError(errMsg);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [deepLinkedConversationId]);

  React.useEffect(() => {
    let isMounted = true;

    async function init() {
      await Promise.resolve();
      if (!isMounted) return;

      if (!isAuthLoading) {
        if (isAuthenticated) {
          setIsLoadingConversations(true);
          await fetchConversations();
        } else {
          setIsLoadingConversations(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, fetchConversations]);

  // 3. Mark conversation read
  const markAsRead = React.useCallback(
    async (conversationId: string, lastSequence: number) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${apiUrl}/api/conversations/${conversationId}/read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ lastReadSequence: lastSequence }),
        });

        // Locally clear unread count for this conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        );
      } catch {
        // Read receipt failure shouldn't disrupt messaging
      }
    },
    []
  );

  // 4. Fetch messages for active conversation
  React.useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      await Promise.resolve();
      if (!isMounted) return;

      try {
        setIsLoadingMessages(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(
          `${apiUrl}/api/conversations/${selectedConversationId}/messages?limit=50`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await res.json();
        const loadedMessages: MessageData[] = Array.isArray(data.messages)
          ? data.messages
          : [];

        if (isMounted) {
          setMessages(loadedMessages);

          // Mark conversation as read with highest sequence
          if (loadedMessages.length > 0) {
            const highestSeq = Math.max(
              ...loadedMessages.map((m) => m.sequence || 0)
            );
            markAsRead(selectedConversationId, highestSeq);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg =
            err instanceof Error ? err.message : "Error loading messages";
          setError(errMsg);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    }

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedConversationId, markAsRead]);

  // 4b. Real-time WebSocket Listeners for incoming messages and read receipts
  React.useEffect(() => {
    const unsubNewMessage = subscribe("message:new", (raw: unknown) => {
      const newMsg = raw as MessageData & { conversationId: string };
      if (!newMsg || !newMsg.conversationId) return;

      const isViewing = newMsg.conversationId === selectedConversationId;

      // 1. If currently viewing this conversation, append live message
      if (isViewing) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Automatically mark as read
        if (newMsg.sequence) {
          markAsRead(newMsg.conversationId, newMsg.sequence);
        }
      } else {
        // Increment global navbar unread badge
        setUnreadMessagesCount((prev) => prev + 1);
      }

      // Check if conversation exists using ref (outside any state updater)
      const existing = conversationsRef.current.find((c) => c.id === newMsg.conversationId);
      if (!existing) {
        fetchConversations();
        return;
      }

      // 2. Purely update conversation snippet, unread count, and bump to top of sidebar
      setConversations((prev) => {
        const item = prev.find((c) => c.id === newMsg.conversationId);
        if (!item) return prev;

        const updatedItem: ConversationItemData = {
          ...item,
          unreadCount: isViewing ? item.unreadCount : (item.unreadCount || 0) + 1,
          lastMessage: {
            id: newMsg.id,
            content: newMsg.content,
            senderId: newMsg.senderId,
            sequence: newMsg.sequence,
            createdAt: newMsg.createdAt,
          },
        };
        const others = prev.filter((c) => c.id !== newMsg.conversationId);
        return [updatedItem, ...others];
      });
    });

    // Listener for read receipts
    const unsubReadReceipt = subscribe("conversation:read", (raw: unknown) => {
      const data = raw as { conversationId: string; lastReadSequence: number };
      if (!data || !data.conversationId) return;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    });

    return () => {
      unsubNewMessage();
      unsubReadReceipt();
    };
  }, [
    selectedConversationId,
    subscribe,
    markAsRead,
    fetchConversations,
    setUnreadMessagesCount,
  ]);

  // 5. Send message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      setIsSendingMessage(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(
        `${apiUrl}/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content }),
        }
      );

      let data: Record<string, unknown> | null = null;
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        // Non-JSON response (e.g. 502/504 HTML error page)
      }

      if (!res.ok) {
        const errorMsg =
          (data && typeof data.message === "string" ? data.message : null) ||
          `Failed to send message (${res.status})`;
        throw new Error(errorMsg);
      }

      const newMsg = (data?.message || data) as MessageData;
      if (!newMsg || !newMsg.id) {
        throw new Error("Invalid message response from server");
      }

      // Optimistic append to messages with deduplication
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Update lastMessage and bump conversation to top of list
      setConversations((prev) => {
        const item = prev.find((c) => c.id === selectedConversationId);
        if (!item) return prev;
        const updatedItem: ConversationItemData = {
          ...item,
          lastMessage: {
            id: newMsg.id,
            content: newMsg.content,
            senderId: newMsg.senderId,
            sequence: newMsg.sequence,
            createdAt: newMsg.createdAt,
          },
        };
        const others = prev.filter((c) => c.id !== selectedConversationId);
        return [updatedItem, ...others];
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error sending message";
      setError(errMsg);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Currently selected conversation object
  const activeConversation = React.useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // Auth loading gate
  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-charcoal-600">
          Checking campus authorization...
        </p>
      </div>
    );
  }

  // Unauthenticated prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-500">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-charcoal-900 font-jakarta">
              Sign In to View Messages
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              Log in with your verified campus email to discuss listings, agree on prices, and coordinate meetups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/conversations")}
            className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-5rem)] md:h-[calc(100vh-4rem)] bg-canvas p-0 md:p-4 lg:p-6 flex flex-col overflow-hidden">
      <div className="max-w-7xl w-full mx-auto flex-1 flex md:rounded-3xl md:border md:border-charcoal-200/80 md:shadow-xs bg-white overflow-hidden">
        {/* 1. Left Sidebar: Conversation List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 flex-col shrink-0 h-full",
            selectedConversationId ? "hidden md:flex" : "flex"
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={(id) => setSelectedConversationId(id)}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* 2. Right Pane: Active Message Thread */}
        <div
          className={cn(
            "flex-1 flex-col h-full overflow-hidden",
            selectedConversationId
              ? "fixed top-16 bottom-0 left-0 right-0 z-40 bg-white flex md:static md:z-auto md:h-full md:flex-1"
              : "hidden md:flex"
          )}
        >
          <MessagePanel
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoadingMessages={isLoadingMessages}
            isSending={isSendingMessage}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversationId(null)}
            error={error}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-charcoal-600">
            Loading conversations...
          </p>
        </div>
      }
    >
      <ConversationsContent />
    </React.Suspense>
  );
}