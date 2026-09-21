export function getAccessTokenFromCookie(cookieHeader?: String) {
    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";");

    for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split("=");

        if (name == "accessToken") {
            return valueParts.join("=") || null;
        }
    }

    return null;
}