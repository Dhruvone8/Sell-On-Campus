export function getAccessTokenFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split("=");

        if (name === "accessToken") {
            const token = valueParts.join("=").trim();
            if (token) {
                return token;
            }
        }
    }

    return null;
}