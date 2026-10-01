import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            const isAllowed =
                origin === "http://localhost:3000" ||
                origin === "http://127.0.0.1:3000" ||
                /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
                /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
                /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin);

            if (isAllowed) {
                return callback(null, true);
            }

            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true
    })
);
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
app.use("/api/users", userRoutes);

export default app;