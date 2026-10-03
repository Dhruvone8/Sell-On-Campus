import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeWebSocketServer } from "./websocket/websocket.server.js";
import { connectRedis } from "./lib/cache/redis.js";

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
});