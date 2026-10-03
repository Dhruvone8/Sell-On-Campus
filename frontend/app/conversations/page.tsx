"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useInboxStore } from "@/lib/stores/inbox.store";
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
import { API_URL } from "@/lib/constants";

function ConversationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkedConversationId = searchParams.get("conversationId") || searchParams.get("id");

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isConnected, subscribe } = useSocket();

  // ── Store selectors ──────────────────────────────────────────────────────
  const conversations        = useInboxStore((s) => s.conversations);
  const selectedConversationId = useInboxStore((s) => s.selectedConversationId);
  const currentPendingConversation = useInboxStore((s) => s.currentPendingConversation);
  const messages             = useInboxStore((s) => s.messages);
  const isLoadingConversations = useInboxStore((s) => s.isLoadingConversations);
  const isLoadingMessages    = useInboxStore((s) => s.isLoadingMessages);
  const isSendingMessage     = useInboxStore((s) => s.isSendingMessage);
  const peerLastReadSequence = useInboxStore((s) => s.peerLastReadSequence);
  const initialUserLastReadSequence = useInboxStore((s) => s.initialUserLastReadSequence);

  // ── Store actions ─────────────────────────────────────────────────────────
  const setConversations          = useInboxStore((s) => s.setConversations);
  const setIsLoadingConversations = useInboxStore((s) => s.setIsLoadingConversations);
  const updateConversationUnread  = useInboxStore((s) => s.updateConversationUnread);
  const upsertConversation        = useInboxStore((s) => s.upsertConversation);
  const setSelectedConversationId = useInboxStore((s) => s.setSelectedConversationId);
  const setCurrentPendingConversation = useInboxStore((s) => s.setCurrentPendingConversation);
  const setMessages               = useInboxStore((s) => s.setMessages);
  const appendMessage             = useInboxStore((s) => s.appendMessage);
  const setIsLoadingMessages      = useInboxStore((s) => s.setIsLoadingMessages);
  const setIsSendingMessage       = useInboxStore((s) => s.setIsSendingMessage);
  const setPeerLastReadSequence   = useInboxStore((s) => s.setPeerLastReadSequence);
  const setInitialUserLastReadSequence = useInboxStore((s) => s.setInitialUserLastReadSequence);
  const resetActiveChat           = useInboxStore((s) => s.resetActiveChat);
  const setUnreadMessagesCount    = useInboxStore((s) => s.setUnreadMessagesCount);

  // currentUserId is fetched from /api/users/me and kept in local state — it's a
  // derived value of the auth session, not inbox data.
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // ── Local-only UI state (not shared, stays local) ────────────────────────
  const [error, setError] = React.useState<string | null>(null);

  // Keep a ref so WebSocket handlers and fetcher can read the live list and deepLinkedId without stale closures
  const conversationsRef = React.useRef<ConversationItemData[]>(conversations);
  React.useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const deepLinkedConversationIdRef = React.useRef(deepLinkedConversationId);
  React.useEffect(() => {
    deepLinkedConversationIdRef.current = deepLinkedConversationId;
  }, [deepLinkedConversationId]);

  // 1. Fetch current user profile to determine currentUserId
  React.useEffect(() => {
    let isMounted = true;

    async function fetchMe() {
      await Promise.resolve();
      if (!isMounted || !isAuthenticated) return;

      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
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
  const fetchConversations = React.useCallback(async (targetIdOverride?: string) => {
    // Capture session generation BEFORE the first await.
    // If logout fires while we're waiting, the generation will have incremented
    // and every post-await guard below will bail out before writing stale data.
    const gen = useAuthStore.getState().sessionGeneration;

    try {
      setError(null);

      const res = await fetch(`${API_URL}/api/conversations?limit=50`, {
        method: "GET",
        credentials: "include",
      });

      // ── Session guard ───────────────────────────────────────────────────
      if (useAuthStore.getState().sessionGeneration !== gen) return;

      if (!res.ok) {
        if (res.status === 401) {
          setError("You must be logged in to access messages.");
          return;
        }
        throw new Error("Failed to load conversations");
      }

      const data = await res.json();

      // ── Session guard ───────────────────────────────────────────────────
      if (useAuthStore.getState().sessionGeneration !== gen) return;

      const list: ConversationItemData[] = Array.isArray(data.conversations)
        ? (data.conversations as ConversationItemData[]).filter(
            (c: ConversationItemData) => Boolean(c.lastMessage)
          )
        : [];

      // Determine which conversation is or will be active without stale closure
      const currentSelectedId = useInboxStore.getState().selectedConversationId;
      const targetParamId = targetIdOverride ?? deepLinkedConversationIdRef.current;

      let targetSelectedId: string | null = null;
      if (targetParamId) {
        targetSelectedId = targetParamId;
      } else if (list.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
        targetSelectedId =
          currentSelectedId && list.some((c) => c.id === currentSelectedId)
            ? currentSelectedId
            : list[0].id;
      } else if (currentSelectedId && list.some((c) => c.id === currentSelectedId)) {
        targetSelectedId = currentSelectedId;
      }

      // Immediately sync global unread count: active conversation unread is treated as 0
      const totalUnread = list.reduce(
        (acc: number, c: ConversationItemData) =>
          acc + (c.id === targetSelectedId ? 0 : c.unreadCount || 0),
        0
      );
      setUnreadMessagesCount(totalUnread);

      // In the local list, clear unreadCount for the actively opened conversation
      const sanitizedList = targetSelectedId
        ? list.map((c) => (c.id === targetSelectedId ? { ...c, unreadCount: 0 } : c))
        : list;

      setConversations(sanitizedList);

      // Handle deep linked conversation
      if (targetParamId) {
        const inList = sanitizedList.find((c) => c.id === targetParamId);
        if (inList) {
          setSelectedConversationId(targetParamId);
          setCurrentPendingConversation(null);
        } else {
          // Fetch single conversation details so user can start chatting
          try {
            const singleRes = await fetch(
              `${API_URL}/api/conversations/${targetParamId}`,
              {
                method: "GET",
                credentials: "include",
              }
            );

            // ── Session guard ─────────────────────────────────────────────
            if (useAuthStore.getState().sessionGeneration !== gen) return;

            if (singleRes.ok) {
              const singleData = await singleRes.json();

              // ── Session guard ───────────────────────────────────────────
              if (useAuthStore.getState().sessionGeneration !== gen) return;

              if (singleData.conversation) {
                if (singleData.conversation.lastMessage) {
                  upsertConversation({ ...singleData.conversation, unreadCount: 0 });
                  setCurrentPendingConversation(null);
                } else {
                  // Keep empty conversation out of list, but active in message panel
                  setCurrentPendingConversation(singleData.conversation);
                }
                setSelectedConversationId(targetParamId);
              }
            } else {
              setSelectedConversationId(
                sanitizedList.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768
                  ? sanitizedList[0].id
                  : null
              );
              setCurrentPendingConversation(null);
            }
          } catch {
            if (useAuthStore.getState().sessionGeneration !== gen) return;
            setSelectedConversationId(
              sanitizedList.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768
                ? sanitizedList[0].id
                : null
            );
            setCurrentPendingConversation(null);
          }
        }
      } else if (sanitizedList.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
        setSelectedConversationId(
          currentSelectedId && sanitizedList.some((c) => c.id === currentSelectedId)
            ? currentSelectedId
            : sanitizedList[0].id
        );
        setCurrentPendingConversation(null);
      } else if (typeof window !== "undefined" && window.innerWidth < 768 && !currentSelectedId) {
        setSelectedConversationId(null);
        setCurrentPendingConversation(null);
      }
    } catch (err: unknown) {
      if (useAuthStore.getState().sessionGeneration !== gen) return;
      const errMsg = err instanceof Error ? err.message : "Error loading chats";
      setError(errMsg);
    } finally {
      if (useAuthStore.getState().sessionGeneration === gen) {
        setIsLoadingConversations(false);
      }
    }
  }, [
    setConversations,
    setIsLoadingConversations,
    setSelectedConversationId,
    setCurrentPendingConversation,
    setUnreadMessagesCount,
    upsertConversation,
  ]);

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
  }, [isAuthLoading, isAuthenticated, fetchConversations, setIsLoadingConversations]);

  // 2b. Synchronize active selection when URL deep link changes (without refetching list)
  React.useEffect(() => {
    if (deepLinkedConversationId) {
      if (selectedConversationId !== deepLinkedConversationId) {
        setSelectedConversationId(deepLinkedConversationId);
        setCurrentPendingConversation(null);
      }
    } else {
      // URL has no conversation query param (e.g. user navigated back to /conversations)
      // On mobile screens, deselect so the conversation list is visible
      if (typeof window !== "undefined" && window.innerWidth < 768 && selectedConversationId) {
        setSelectedConversationId(null);
        setCurrentPendingConversation(null);
      }
    }
  }, [deepLinkedConversationId, selectedConversationId, setSelectedConversationId, setCurrentPendingConversation]);

  // 3. Mark conversation read
  const markAsRead = React.useCallback(
    async (conversationId: string, lastSequence: number) => {
      // Find how many unread messages this conversation currently has and deduct from global state
      const target = conversationsRef.current.find((c) => c.id === conversationId);
      const unreadToDeduct = target?.unreadCount || 0;
      if (unreadToDeduct > 0) {
        setUnreadMessagesCount((count) => Math.max(0, count - unreadToDeduct));
      }
      updateConversationUnread(conversationId, 0);

      try {
        await fetch(`${API_URL}/api/conversations/${conversationId}/read`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lastReadSequence: lastSequence }),
        });
      } catch {
        // Read receipt failure shouldn't disrupt messaging
      }
    },
    [setUnreadMessagesCount, updateConversationUnread]
  );

  // 4. Fetch messages for active conversation
  React.useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      if (!selectedConversationId) {
        resetActiveChat();
        return;
      }

      await Promise.resolve();
      if (!isMounted) return;

      try {
        setIsLoadingMessages(true);
        setError(null);

        const res = await fetch(
          `${API_URL}/api/conversations/${selectedConversationId}/messages?limit=50`,
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

          // Capture read sequence info from API response
          if (typeof data.peerLastReadSequence === "number") {
            setPeerLastReadSequence(data.peerLastReadSequence);
          }
          if (typeof data.userLastReadSequence === "number") {
            setInitialUserLastReadSequence(data.userLastReadSequence);
          }

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
  }, [
    selectedConversationId,
    markAsRead,
    resetActiveChat,
    setMessages,
    setIsLoadingMessages,
    setPeerLastReadSequence,
    setInitialUserLastReadSequence,
  ]);

  // 4b. Real-time WebSocket Listeners for incoming messages and read receipts
  React.useEffect(() => {
    const unsubNewMessage = subscribe("message:new", (raw: unknown) => {
      const newMsg = raw as MessageData & { conversationId: string };
      if (!newMsg || !newMsg.conversationId) return;

      const isViewing = newMsg.conversationId === selectedConversationId;

      // 1. If currently viewing this conversation, append live message
      if (isViewing) {
        appendMessage(newMsg);
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

      // 2. Update conversation snippet, unread count, and bump to top of sidebar
      const item = conversationsRef.current.find((c) => c.id === newMsg.conversationId);
      if (item) {
        const updatedItem: ConversationItemData = {
          ...item,
          unreadCount: isViewing ? 0 : (item.unreadCount || 0) + 1,
          lastMessage: {
            id: newMsg.id,
            content: newMsg.content,
            senderId: newMsg.senderId,
            sequence: newMsg.sequence,
            createdAt: newMsg.createdAt,
          },
        };
        upsertConversation(updatedItem);
      }
    });

    // Listener for read receipts
    const unsubReadReceipt = subscribe("conversation:read", (raw: unknown) => {
      const data = raw as { conversationId: string; lastReadSequence: number };
      if (!data || !data.conversationId) return;

      // Update peer's read sequence for live read receipt checkmarks
      if (data.conversationId === selectedConversationId) {
        setPeerLastReadSequence(data.lastReadSequence);
      }

      updateConversationUnread(data.conversationId, 0);
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
    appendMessage,
    upsertConversation,
    updateConversationUnread,
    setPeerLastReadSequence,
  ]);

  // 5. Send message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      setIsSendingMessage(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      appendMessage(newMsg);

      // Update lastMessage and bump conversation to top of list
      const item =
        conversations.find((c) => c.id === selectedConversationId) ||
        (currentPendingConversation?.id === selectedConversationId
          ? currentPendingConversation
          : null);
      if (item) {
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
        upsertConversation(updatedItem);
      }
      setCurrentPendingConversation(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error sending message";
      setError(errMsg);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Currently selected conversation object
  const activeConversation = React.useMemo(() => {
    if (!selectedConversationId) return null;
    const found = conversations.find((c) => c.id === selectedConversationId);
    if (found) return found;
    if (currentPendingConversation?.id === selectedConversationId) {
      return currentPendingConversation;
    }
    return null;
  }, [conversations, selectedConversationId, currentPendingConversation]);

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
    <div className="h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-4rem)] bg-canvas p-0 md:p-4 lg:p-6 flex flex-col overflow-hidden">
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
            onSelect={(id) => {
              // Immediately clear unread badge for the clicked conversation
              const target = conversations.find((c) => c.id === id);
              const unreadToDeduct = target?.unreadCount || 0;
              if (unreadToDeduct > 0) {
                setUnreadMessagesCount((count) => Math.max(0, count - unreadToDeduct));
              }
              updateConversationUnread(id, 0);
              setSelectedConversationId(id);
              setCurrentPendingConversation(null);
              router.replace(`/conversations?conversationId=${id}`);
            }}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* 2. Right Pane: Active Message Thread */}
        <div
          className={cn(
            "flex-col overflow-hidden",
            selectedConversationId
              ? "fixed inset-x-0 top-16 bottom-0 z-40 bg-white flex md:static md:z-auto md:flex-1 md:h-full"
              : "hidden md:flex md:flex-1 md:h-full"
          )}
        >
          <MessagePanel
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoadingMessages={isLoadingMessages}
            isSending={isSendingMessage}
            onSendMessage={handleSendMessage}
            onBack={() => {
              setSelectedConversationId(null);
              setCurrentPendingConversation(null);
              router.replace("/conversations");
            }}
            error={error}
            isConnected={isConnected}
            peerLastReadSequence={peerLastReadSequence}
            initialUserLastReadSequence={initialUserLastReadSequence}
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