export function getAccessTokenFromCookie(cookieHeader?: string, url?: string) {
    if (cookieHeader) {
        const cookies = cookieHeader.split(";");

        for (const cookie of cookies) {
            const [name, ...valueParts] = cookie.trim().split("=");

            if (name == "accessToken") {
                return valueParts.join("=") || null;
            }
        }
    }

    if (url && url.includes("?")) {
        try {
            const parsedUrl = new URL(url, "http://localhost");
            const token = parsedUrl.searchParams.get("token") || parsedUrl.searchParams.get("accessToken");
            if (token) return token;
        } catch {
            // Ignore parse errors
        }
    }

    return null;
}