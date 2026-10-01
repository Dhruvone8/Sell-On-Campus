import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeWebSocketServer } from "./websocket/websocket.server.js";
import { connectRedis } from "./lib/cache/redis.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeWebSocketServer(server);

await connectRedis();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});