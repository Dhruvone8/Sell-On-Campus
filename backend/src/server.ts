import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeWebSocketServer, closeWebSocketServer } from "./websocket/websocket.server.js";
import { connectRedis } from "./lib/cache/redis.js";
import { startEmailOutboxDispatcher, stopEmailOutboxDispatcher } from "./workers/email-outbox.dispatcher.js";
import { emailQueue } from "./lib/queue/email.queue.js";
import connection from "./lib/queue/connection.js";
import redis from "./lib/cache/redis.js";
import { prisma } from "./lib/prisma.js";
import { closeEmailWorker } from "./workers/email.worker.js";

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

  // Hard deadline to prevent shutdown from hanging indefinitely
  const shutdownTimeout = setTimeout(() => {
    console.error("[Server] Graceful shutdown deadline exceeded (10s). Forcing process exit.");
    process.exit(1);
  }, 10000);
  shutdownTimeout.unref();

  try {
    // 1. Stop Dispatcher from picking up new jobs
    stopEmailOutboxDispatcher();

    // 2. Close WebSocket clients gracefully before terminating HTTP server
    await closeWebSocketServer(2000);

    // 3. Stop accepting new HTTP connections and wait for in-flight requests
    await new Promise<void>((resolve) => {
      server.close((error) => {
        if (error) {
          console.error("[Server] HTTP server shutdown error:", error);
        } else {
          console.log("[Server] HTTP server closed.");
        }
        resolve();
      });

      if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
      }
    });

    // 4. Stop BullMQ worker and wait for active jobs
    await closeEmailWorker();
    console.log("[Server] Email worker closed.");

    // 5. Close BullMQ queue
    await emailQueue.close();
    console.log("[Server] Email queue closed.");

    // 5. Close Node Redis connection (with safety fallback)
    if (redis.isOpen) {
      await Promise.race([
        redis.quit(),
        new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
          redis.disconnect();
        }),
      ]).catch((err) => console.warn("[Server] Warning closing Node Redis:", err));
      console.log("[Server] Node Redis connection closed.");
    }

    // 6. Close BullMQ Redis connection (with safety fallback)
    await Promise.race([
      connection.quit(),
      new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
        connection.disconnect();
      }),
    ]).catch((err) => console.warn("[Server] Warning closing BullMQ Redis:", err));
    console.log("[Server] BullMQ Redis connection closed.");

    // 7. Disconnect Prisma
    await prisma.$disconnect();
    console.log("[Server] Prisma disconnected.");

    clearTimeout(shutdownTimeout);
    console.log("[Server] Graceful shutdown complete.");
    process.exit(0);
  } catch (error) {
    console.error("[Server] Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));