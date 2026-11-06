import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verifyAccessToken } from "../lib/auth/tokens.js";
import { getAccessTokenFromCookie } from "./websocket.auth.js";
import { addUserSocket, removeUserSocket } from "./websocket.manager.js";
import { isAllowedOrigin } from "../utils/origin.util.js";
import { prisma } from "../lib/prisma.js";

interface AliveWebSocket extends WebSocket {
    isAlive: boolean;
}

let wssInstance: WebSocketServer | null = null;

export function initializeWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });
    wssInstance = wss;

    wss.on("connection", async (socket: AliveWebSocket, request) => {
        socket.isAlive = true;

        socket.on("pong", () => {
            socket.isAlive = true;
        });

        try {
            const origin = request.headers.origin;

            // Prevent Cross-Site WebSocket Hijacking (CSWSH)
            if (origin && !isAllowedOrigin(origin)) {
                console.warn(`[WebSocket] Blocked connection from unauthorized origin: ${origin}`);
                socket.close(1008, "Origin not allowed");
                return;
            }

            // In production, require origin header from web clients
            if (process.env.NODE_ENV === "production" && !origin) {
                console.warn("[WebSocket] Blocked connection with missing Origin header in production");
                socket.close(1008, "Origin header required");
                return;
            }

            const accessToken = getAccessTokenFromCookie(request.headers.cookie);

            if (!accessToken) {
                socket.close(1008, "Authentication Required");
                return;
            }

            const { payload } = await verifyAccessToken(accessToken);

            if (payload.type !== "access" || typeof payload.sub !== "string") {
                socket.close(1008, "Invalid Access Token");
                return;
            }

            const userId = payload.sub;

            // Verify user status in database (block banned or suspended accounts)
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { status: true }
            });

            if (!user || user.status !== "ACTIVE") {
                socket.close(1008, "Account suspended or deactivated");
                return;
            }

            console.log("WebSocket Authenticated: ", userId);

            addUserSocket(userId, socket);

            socket.on("close", () => {
                removeUserSocket(userId, socket);
                console.log("WebSocket Client Disconnected: ", userId);
            });

            socket.on("error", (error) => {
                console.error("WebSocket Error: ", error);
            });
        } catch (error) {
            console.error("WebSocket auth error:", error);
            socket.close(1008, "Invalid Access Token");
        }
    });

    const heartBeatInterval = setInterval(() => {
        wss.clients.forEach((client) => {
            const socket = client as AliveWebSocket;

            if (!socket.isAlive) {
                socket.terminate();
                return;
            }

            socket.isAlive = false;
            socket.ping();
        })
    }, 30000)

    wss.on("close", () => {
        clearInterval(heartBeatInterval);
        wssInstance = null;
    });

    return wss;
}

export async function closeWebSocketServer(timeoutMs = 2000): Promise<void> {
    if (!wssInstance) return;

    const wss = wssInstance;

    return new Promise<void>((resolve) => {
        let isDone = false;
        const done = () => {
            if (!isDone) {
                isDone = true;
                resolve();
            }
        };

        // Fallback timer: terminate any client sockets still hanging after timeout
        const forceTimer = setTimeout(() => {
            for (const client of wss.clients) {
                if (client.readyState !== WebSocket.CLOSED) {
                    try {
                        client.terminate();
                    } catch {
                        // ignore termination errors
                    }
                }
            }
            done();
        }, timeoutMs);
        forceTimer.unref();

        // Send standard 1001 "Going Away" close code to all active clients
        for (const client of wss.clients) {
            try {
                if (client.readyState === WebSocket.OPEN) {
                    client.close(1001, "Server shutting down");
                }
            } catch {
                try {
                    client.terminate();
                } catch {
                    // ignore
                }
            }
        }

        wss.close((err) => {
            clearTimeout(forceTimer);
            if (err) {
                console.error("[WebSocket] Error closing WebSocket server:", err);
            } else {
                console.log("[WebSocket] WebSocket server closed.");
            }
            done();
        });
    });
}
