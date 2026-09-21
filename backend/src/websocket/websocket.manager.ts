import type { WebSocket } from "ws";

const userSockets = new Map<string, Set<WebSocket>>();

export function addUserSocket(userId: string, socket: WebSocket) {
    let sockets = userSockets.get(userId);

    if (!sockets) {
        sockets = new Set();
        userSockets.set(userId, sockets);
    }

    sockets.add(socket);
}

export function removeUserSocket(userId: string, socket: WebSocket) {
    const sockets = userSockets.get(userId);

    if (!sockets) {
        return;
    }

    sockets.delete(socket);

    if (sockets.size == 0) {
        userSockets.delete(userId);
    }
}

export function getUserSockets(userId: string) {
    return userSockets.get(userId);
}

export function sendToUser(userId: string, data: unknown) {
    const sockets = getUserSockets(userId);

    if (!sockets) {
        return;
    }

    const message = JSON.stringify(data);

    for (const socket of sockets) {
        if (socket.readyState === socket.OPEN) {
            socket.send(message);
        }
    }
}