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

export function initializeWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });

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
    });

    return wss;
}