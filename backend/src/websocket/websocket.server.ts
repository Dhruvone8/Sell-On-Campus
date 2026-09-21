import { WebSocketServer } from "ws";
import type { Server } from "http";
import { verifyAccessToken } from "../lib/auth/tokens.js";
import { getAccessTokenFromCookie } from "./websocket.auth.js";
import { addUserSocket, removeUserSocket } from "./websocket.manager.js";

export function initializeWebSocketServer(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (socket, request) => {
        try {
            const accessToken = getAccessTokenFromCookie(request.headers.cookie);

            if (!accessToken) {
                socket.close(1008, "Authentication Required");
                return;
            }

            const { payload } = await verifyAccessToken(accessToken);

            if (payload.type !== "access") {
                socket.close(1008, "Invalid Access Token");
                return;
            }

            if (typeof payload.sub !== "string") {
                socket.close(1008, "Invalid Access Token");
                return;
            }

            const userId = payload.sub;

            console.log("WebSocket Authenticated: ", userId);

            addUserSocket(userId, socket);

            socket.on("close", () => {
                removeUserSocket(userId, socket);
                console.log("WebSocket Client Disconnected: ", userId);
            })

            socket.on("error", (error) => {
                console.error("WebSocket Error: ", error);
            });
        } catch (error) {
            socket.close(1008, "Invalid Access Token");
        }
    });

    return wss;
}