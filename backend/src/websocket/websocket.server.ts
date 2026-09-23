import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verifyAccessToken } from "../lib/auth/tokens.js";
import { getAccessTokenFromCookie } from "./websocket.auth.js";
import { addUserSocket, removeUserSocket } from "./websocket.manager.js";
import { Socket } from "dgram";

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