import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api", (req, res) => {
    res.send("SellOnCampus API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;