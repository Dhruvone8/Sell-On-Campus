import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requestOtp, verifyOtpCode } from "../services/auth/otp.service.js";
import { sendPasswordResetOtpEmail, sendRegistrationOtpEmail } from "../services/email/email.service.js";
import argon2 from "argon2";
import {
    createAccessToken, createPasswordResetToken, createRefreshToken, verifyPasswordResetToken, verifyRefreshToken
} from "../lib/auth/tokens.js";
import { setAuthCookies, setAccessTokenCookie, clearAuthCookies } from "../lib/auth/cookies.js";
import { normalizeEmail, isCollegeEmail } from "../lib/validation/email.js";

export async function requestRegistrationOtp(req: Request, res: Response) {
    try {
        const { email } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!isCollegeEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Email must be a valid VIT email address" });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const otp = await requestOtp(normalizedEmail, "REGISTRATION");

        await sendRegistrationOtpEmail(normalizedEmail, otp);

        return res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error requesting registration OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function verifyRegistrationOtp(req: Request, res: Response) {
    try {
        const { email, otp } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (typeof otp !== "string" || !/^\d{4}$/.test(otp)) {
            return res.status(400).json({ message: "A valid 4-digit OTP code is required" });
        }

        const isVerified = await verifyOtpCode(normalizedEmail, otp, "REGISTRATION");

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        return res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        console.error("Error verifying registration OTP:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function register(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!isCollegeEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Email must be a valid VIT email address" });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const verification = await prisma.verification.findFirst({
            where: {
                email: normalizedEmail,
                purpose: "REGISTRATION",
                verifiedAt: {
                    not: null,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!verification) {
            return res.status(400).json({ message: "Email not verified" });
        }

        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                passwordHash: hashedPassword,
                emailVerifiedAt: verification.verifiedAt!,
            },
        });

        await prisma.verification.delete({
            where: {
                id: verification.id,
            },
        });

        const accessToken = await createAccessToken(user.id);
        const refreshToken = await createRefreshToken(user.id);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(201).json({ message: "Registration successful" });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({ message: "Account is Banned or Suspended" });
        }

        if (!user.passwordHash) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        const accessToken = await createAccessToken(user.id,);
        const refreshToken = await createRefreshToken(user.id);

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({ message: "Login Successful" });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function refreshAccessToken(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = await verifyRefreshToken(refreshToken);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, status: true }
        });

        if (!user || user.status !== "ACTIVE") {
            clearAuthCookies(res);
            return res.status(403).json({ message: "Account is suspended or deactivated" });
        }

        const accessToken = await createAccessToken(user.id);

        setAccessTokenCookie(res, accessToken);

        return res.status(200).json({ message: "Access token refreshed successfully" });

    } catch (error) {
        console.error("Refresh token error:", error);
        clearAuthCookies(res);
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export function logout(_req: Request, res: Response) {
    clearAuthCookies(res);

    return res.status(200).json({ message: "Logout Successful" });
}

export async function requestPasswordResetOtp(req: Request, res: Response) {
    try {
        const { email } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!isCollegeEmail(normalizedEmail)) {
            return res.status(400).json({
                message: "Email must be a valid VIT email address"
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (user) {
            const otp = await requestOtp(normalizedEmail, "PASSWORD_RESET");

            await sendPasswordResetOtpEmail(normalizedEmail, otp);
        }

        return res.status(200).json({ message: "OTP sent for Password Reset" });

    } catch (error) {
        console.error("Password reset OTP error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function verifyPasswordResetOtp(req: Request, res: Response) {
    try {
        const { email, otp } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }

        if (!isCollegeEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Email must be a valid VIT email address" });
        }

        const isValid = await verifyOtpCode(normalizedEmail, otp, "PASSWORD_RESET");

        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            }
        })

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP " });
        }

        const resetToken = await createPasswordResetToken(user.id);

        return res.status(200).json({ message: "OTP verified successfully", resetToken });

    } catch (error) {
        console.error("Password reset OTP verification error: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const { resetToken, newPassword } = req.body;

        if (typeof resetToken !== "string" || !resetToken.trim()) {
            return res.status(400).json({ message: "Reset Token is required" });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters long" })
        }

        const userId = await verifyPasswordResetToken(resetToken);

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid reset request" });
        }

        const hashedPassword = await argon2.hash(newPassword);

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                passwordHash: hashedPassword,
            }
        });

        return res.status(200).json({ message: "Password Reset Successfully" });

    } catch (error) {
        console.error("Password reset error: ", error);
        return res.status(401).json({ message: "Invalid or expired reset token" });
    }
}