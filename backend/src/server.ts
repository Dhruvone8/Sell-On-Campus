import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeWebSocketServer } from "./websocket/websocket.server.js";
import { connectRedis } from "./lib/cache/redis.js";
import { startEmailOutboxDispatcher, stopEmailOutboxDispatcher } from "./workers/email-outbox.dispatcher.js";
import { emailQueue } from "./lib/queue/email.queue.js";
import connection from "./lib/queue/connection.js";
import redis from "./lib/cache/redis.js"
import { prisma } from "./lib/prisma.js"

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeWebSocketServer(server);

try {
  await connectRedis();
  console.log("Connected to Redis successfully");
} catch (error) {
  console.warn("⚠️ Redis connection failed. Server will continue with caching and rate limiting disabled:", error);
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startEmailOutboxDispatcher();
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`\n[Server] ${signal} received. Starting graceful shutdown...`);

  // Stop Dispatcher from picking up new jobs
  stopEmailOutboxDispatcher();

  // Stop accepting new HTTP connections
  server.close(async (error) => {
    if (error) {
      console.error("[Server] HTTP server shutdown error: ", error);
    }

    try {
      await emailQueue.close();
      console.log("[Server] Email queue closed.");

      if (redis.isOpen) {
        await redis.quit();
        console.log("[SERVER] Node Redis Connection Closed.")
      }

      await connection.quit();
      console.log("[SERVER] BullMQ Redis Connection Closed.")

      await prisma.$disconnect();
      console.log("[SERVER] Prisma Disconnected.")

      console.log("[SERVER] Graceful Shutdown Complete.")
      process.exit(0);
    } catch (error) {
      console.error("[SERVER] Error during shutdown: ", error);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));