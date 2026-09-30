"use client";

import * as React from "react";
import { useAuth } from "./auth-context";
import { WS_URL } from "./constants";

export type WebSocketEventPayload = {
  type: string;
  data: unknown;
};

export type WebSocketHandler = (data: unknown) => void;

interface SocketContextType {
  isConnected: boolean;
  subscribe: (eventType: string, handler: WebSocketHandler) => () => void;
  send: (type: string, data?: unknown) => void;
}

const SocketContext = React.createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [rawConnected, setRawConnected] = React.useState(false);

  const socketRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = React.useRef(0);
  const listenersRef = React.useRef<Map<string, Set<WebSocketHandler>>>(new Map());
  const connectRef = React.useRef<() => void>(() => {});

  // Keep ref of current auth state to avoid stale closure issues
  const isAuthenticatedRef = React.useRef(isAuthenticated);
  React.useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Track sockets intentionally closed (logout, cleanup, or manual reconnect) to prevent unexpected reconnect triggers
  const intentionalCloseSocketsRef = React.useRef<WeakSet<WebSocket>>(new WeakSet());

  // Subscribe to specific event types
  const subscribe = React.useCallback((eventType: string, handler: WebSocketHandler) => {
    // Normalize event type: remove spaces around colon
    const normalizedType = eventType.replace(/\s*:\s*/g, ":");
    let handlers = listenersRef.current.get(normalizedType);
    if (!handlers) {
      handlers = new Set();
      listenersRef.current.set(normalizedType, handlers);
    }
    handlers.add(handler);

    return () => {
      handlers?.delete(handler);
      if (handlers && handlers.size === 0) {
        listenersRef.current.delete(normalizedType);
      }
    };
  }, []);

  // Send message over WebSocket
  const send = React.useCallback((type: string, data?: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  // Intentionally disconnect and clean up active socket and pending reconnects
  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;

    if (socketRef.current) {
      const socket = socketRef.current;
      socketRef.current = null;
      intentionalCloseSocketsRef.current.add(socket);
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      try {
        socket.close();
      } catch {
        // Socket already closed
      }
    }
  }, []);

  // Connect to WebSocket server
  const connect = React.useCallback(() => {
    if (typeof window === "undefined" || !isAuthenticatedRef.current) return;

    // Clear any pending reconnect attempt
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clean up existing socket intentionally before opening a new one
    if (socketRef.current) {
      const existingSocket = socketRef.current;
      socketRef.current = null;
      intentionalCloseSocketsRef.current.add(existingSocket);
      existingSocket.onopen = null;
      existingSocket.onmessage = null;
      existingSocket.onerror = null;
      existingSocket.onclose = null;
      try {
        existingSocket.close();
      } catch {
        // Socket already closed
      }
    }

    try {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        if (socketRef.current !== socket || intentionalCloseSocketsRef.current.has(socket)) return;
        setRawConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        if (socketRef.current !== socket || intentionalCloseSocketsRef.current.has(socket)) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && typeof parsed.type === "string") {
            const normalizedType = parsed.type.replace(/\s*:\s*/g, ":");
            const handlers = listenersRef.current.get(normalizedType);
            if (handlers) {
              handlers.forEach((handler) => {
                try {
                  handler(parsed.data);
                } catch (err) {
                  console.error(`Error in WebSocket listener for ${normalizedType}:`, err);
                }
              });
            }
          }
        } catch {
          // Non-JSON message from server
        }
      };

      socket.onclose = () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
          setRawConnected(false);
        }

        // If this socket was closed intentionally (e.g., logout or cleanup), do NOT reconnect
        if (intentionalCloseSocketsRef.current.has(socket)) {
          return;
        }

        // Auto-reconnect with exponential backoff if still authenticated
        if (isAuthenticatedRef.current) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current();
          }, delay);
        }
      };

      socket.onerror = () => {
        // Handled via onclose
      };
    } catch (err) {
      console.warn("Could not initiate WebSocket connection:", err);
    }
  }, []);

  React.useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  React.useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  const isConnected = Boolean(isAuthenticated && rawConnected);

  return (
    <SocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
