import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from "./routes/user.routes.js";
import { isAllowedOrigin } from "./utils/origin.util.js";
import { verifyMutationOrigin } from "./middleware/csrf.middleware.js";
import { AppError } from "./lib/error.js";

const app = express();

// Trust reverse proxy (Render, Vercel, Cloudflare, etc.) for accurate client IP resolution
app.set("trust proxy", 1);

app.use(
    cors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin) return callback(null, true);

            if (isAllowedOrigin(origin)) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true
    })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Enforce Origin/Referer check on state-changing requests to mitigate CSRF with cross-site cookies
app.use("/api", verifyMutationOrigin);

// Routes
app.get("/api", (_req: Request, res: Response) => {
    res.send("SellOnCampus API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Centralized JSON error handler (prevents stack trace / HTML leakage)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled API error:", err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON payload" });
    }

    return res.status(500).json({
        message: "Internal server error",
    });
});

export default app;