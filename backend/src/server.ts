import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initializeWebSocketServer } from "./websocket/websocket.server.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});