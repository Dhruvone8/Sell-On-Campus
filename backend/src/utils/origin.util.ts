const isProduction = process.env.NODE_ENV === "production";

export function getAllowedOrigins(): string[] {
    const configuredOrigins: string[] = [];

    if (process.env.FRONTEND_URL) {
        configuredOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ""));
    }

    if (process.env.ALLOWED_ORIGINS) {
        const parts = process.env.ALLOWED_ORIGINS.split(",")
            .map((o) => o.trim().replace(/\/$/, ""))
            .filter(Boolean);
        configuredOrigins.push(...parts);
    }

    return Array.from(new Set(configuredOrigins));
}

export function isAllowedOrigin(origin?: string): boolean {
    if (!origin) return false;

    const normalized = origin.trim().replace(/\/$/, "");
    const allowed = getAllowedOrigins();

    if (allowed.includes(normalized)) {
        return true;
    }

    // Allow Vercel deployment domains if matches preview/production patterns
    if (
        /^https:\/\/[a-z0-9-]+(\.vercel\.app)$/i.test(normalized) ||
        /^https:\/\/[a-z0-9-]+-[a-z0-9-]+\.vercel\.app$/i.test(normalized)
    ) {
        // If ALLOW_VERCEL_PREVIEWS is enabled or it matches configured origins
        if (process.env.ALLOW_ALL_VERCEL_DOMAINS === "true") {
            return true;
        }
    }

    // Allow local development origins in non-production
    if (!isProduction) {
        if (
            normalized === "http://localhost:3000" ||
            normalized === "http://127.0.0.1:3000" ||
            /^http:\/\/localhost:\d+$/.test(normalized) ||
            /^http:\/\/127\.0\.0\.1:\d+$/.test(normalized) ||
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(normalized) ||
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(normalized) ||
            /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(normalized)
        ) {
            return true;
        }
    }

    return false;
}
