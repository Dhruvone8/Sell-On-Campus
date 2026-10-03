import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ConversationItemData } from "@/components/conversations/conversation-item";
import type { MessageData } from "@/components/conversations/message-panel";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface InboxState {
  // ── Badge counts (formerly in AuthContext) ──────────────────────────────
  unreadMessagesCount: number;
  unreadNotificationsCount: number;

  // ── Conversations list ──────────────────────────────────────────────────
  conversations: ConversationItemData[];
  isLoadingConversations: boolean;

  // ── Active conversation ─────────────────────────────────────────────────
  selectedConversationId: string | null;
  /** Transient pending conversation (not yet persisted — e.g. "start chat" flow) */
  currentPendingConversation: ConversationItemData | null;

  // ── Messages ────────────────────────────────────────────────────────────
  messages: MessageData[];
  isLoadingMessages: boolean;
  isSendingMessage: boolean;

  // ── Read-receipt sequences ───────────────────────────────────────────────
  /** Highest sequence the peer has read — drives single/double checkmark */
  peerLastReadSequence: number;
  /** User's own lastReadSequence at the time messages were first loaded — drives "Unread Messages" divider */
  initialUserLastReadSequence: number | undefined;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface InboxActions {
  // Badge counts
  setUnreadMessagesCount: (n: number | ((prev: number) => number)) => void;
  setUnreadNotificationsCount: (n: number | ((prev: number) => number)) => void;

  // Conversations list
  setConversations: (conversations: ConversationItemData[]) => void;
  setIsLoadingConversations: (value: boolean) => void;
  /** Update a single conversation's unread count in-place */
  updateConversationUnread: (conversationId: string, unreadCount: number) => void;
  /** Prepend a brand-new conversation to the top of the list */
  prependConversation: (conversation: ConversationItemData) => void;
  /** Replace/upsert a conversation by id (e.g. after a new message arrives) */
  upsertConversation: (conversation: ConversationItemData) => void;

  // Active conversation selection
  setSelectedConversationId: (id: string | null) => void;
  setCurrentPendingConversation: (conversation: ConversationItemData | null) => void;

  // Messages
  setMessages: (messages: MessageData[]) => void;
  appendMessage: (message: MessageData) => void;
  setIsLoadingMessages: (value: boolean) => void;
  setIsSendingMessage: (value: boolean) => void;

  // Read-receipt sequences
  setPeerLastReadSequence: (sequence: number) => void;
  setInitialUserLastReadSequence: (sequence: number | undefined) => void;

  /** Reset active-chat state when switching conversations */
  resetActiveChat: () => void;
  /** Full store reset on logout */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialState: InboxState = {
  unreadMessagesCount: 0,
  unreadNotificationsCount: 0,
  conversations: [],
  isLoadingConversations: true,
  selectedConversationId: null,
  currentPendingConversation: null,
  messages: [],
  isLoadingMessages: false,
  isSendingMessage: false,
  peerLastReadSequence: 0,
  initialUserLastReadSequence: undefined,
};

export const useInboxStore = create<InboxState & InboxActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // ── Badge counts ────────────────────────────────────────────────────
      setUnreadMessagesCount: (n) =>
        set(
          (s) => ({
            unreadMessagesCount:
              typeof n === "function" ? n(s.unreadMessagesCount) : n,
          }),
          false,
          "inbox/setUnreadMessagesCount"
        ),

      setUnreadNotificationsCount: (n) =>
        set(
          (s) => ({
            unreadNotificationsCount:
              typeof n === "function" ? n(s.unreadNotificationsCount) : n,
          }),
          false,
          "inbox/setUnreadNotificationsCount"
        ),

      // ── Conversations list ──────────────────────────────────────────────
      setConversations: (conversations) =>
        set({ conversations }, false, "inbox/setConversations"),

      setIsLoadingConversations: (isLoadingConversations) =>
        set({ isLoadingConversations }, false, "inbox/setIsLoadingConversations"),

      updateConversationUnread: (conversationId, unreadCount) =>
        set(
          (s) => ({
            conversations: s.conversations.map((c) =>
              c.id === conversationId ? { ...c, unreadCount } : c
            ),
          }),
          false,
          "inbox/updateConversationUnread"
        ),

      prependConversation: (conversation) =>
        set(
          (s) => ({ conversations: [conversation, ...s.conversations] }),
          false,
          "inbox/prependConversation"
        ),

      upsertConversation: (conversation) =>
        set(
          (s) => {
            const exists = s.conversations.some((c) => c.id === conversation.id);
            if (exists) {
              return {
                conversations: s.conversations.map((c) =>
                  c.id === conversation.id ? conversation : c
                ),
              };
            }
            return { conversations: [conversation, ...s.conversations] };
          },
          false,
          "inbox/upsertConversation"
        ),

      // ── Active conversation ─────────────────────────────────────────────
      setSelectedConversationId: (selectedConversationId) =>
        set({ selectedConversationId }, false, "inbox/setSelectedConversationId"),

      setCurrentPendingConversation: (currentPendingConversation) =>
        set(
          { currentPendingConversation },
          false,
          "inbox/setCurrentPendingConversation"
        ),

      // ── Messages ────────────────────────────────────────────────────────
      setMessages: (messages) =>
        set({ messages }, false, "inbox/setMessages"),

      appendMessage: (message) =>
        set(
          (s) => ({ messages: [...s.messages, message] }),
          false,
          "inbox/appendMessage"
        ),

      setIsLoadingMessages: (isLoadingMessages) =>
        set({ isLoadingMessages }, false, "inbox/setIsLoadingMessages"),

      setIsSendingMessage: (isSendingMessage) =>
        set({ isSendingMessage }, false, "inbox/setIsSendingMessage"),

      // ── Read-receipt sequences ──────────────────────────────────────────
      setPeerLastReadSequence: (peerLastReadSequence) =>
        set({ peerLastReadSequence }, false, "inbox/setPeerLastReadSequence"),

      setInitialUserLastReadSequence: (initialUserLastReadSequence) =>
        set(
          { initialUserLastReadSequence },
          false,
          "inbox/setInitialUserLastReadSequence"
        ),

      // ── Resets ──────────────────────────────────────────────────────────
      resetActiveChat: () =>
        set(
          {
            messages: [],
            peerLastReadSequence: 0,
            initialUserLastReadSequence: undefined,
          },
          false,
          "inbox/resetActiveChat"
        ),

      reset: () => set(initialState, false, "inbox/reset"),
    }),
    { name: "InboxStore" }
  )
);
