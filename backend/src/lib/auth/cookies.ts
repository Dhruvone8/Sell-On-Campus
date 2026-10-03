import type { Response } from "express";
const isProduction = process.env.NODE_ENV === "production";

export const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("accessToken", accessToken, {
        ...baseCookieOptions,
        maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        ...baseCookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie("accessToken", accessToken, {
        ...baseCookieOptions,
        maxAge: 1000 * 60 * 15
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken", baseCookieOptions);
    res.clearCookie("refreshToken", baseCookieOptions);
}