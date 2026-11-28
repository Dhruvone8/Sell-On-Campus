import { prisma } from '../../lib/prisma.js';
import { generateOtp, hashOtp, verifyOtp } from '../../lib/auth/otp.js';

const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function cleanupOtp(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    await prisma.verification.deleteMany({
        where: {
            email,
            purpose,
        },
    });
}

export async function requestOtp(email: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);

    // Delete any existing OTPs for the same email and purpose
    await prisma.verification.deleteMany({
        where: {
            email,
            purpose
        },
    });

    // Store the new OTP in the database
    await prisma.verification.create({
        data: {
            email,
            hashedOtp,
            purpose,
            expiresAt
        },
    });

    return otp; // Return the plain OTP to be sent to the user
}

export async function verifyOtpCode(email: string, otp: string, purpose: "REGISTRATION" | "PASSWORD_RESET") {
    const otpRecord = await prisma.verification.findFirst({
        where: {
            email,
            purpose,
            verifiedAt: null
        },
        orderBy: {
            createdAt: 'desc'
        },
    });

    if (!otpRecord) return false; // No OTP found for the given email and purpose

    if (otpRecord.expiresAt < new Date()) {
        // OTP has expired, delete it from the database
        await prisma.verification.delete({
            where: {
                id: otpRecord.id
            }
        })

        return false;
    }

    // If the number of attempts has reached the limit, delete the OTP and return false
    if (otpRecord.attempts >= 5) {
        await prisma.verification.delete({
            where: {
                id: otpRecord.id
            },
        });

        return false;
    }

    // Check if the provided OTP matches the hashed OTP in the database
    const isValid = await verifyOtp(otp, otpRecord.hashedOtp);

    // If the OTP is invalid, increment the attempts counter and return false
    if (!isValid) {
        await prisma.verification.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                attempts: {
                    increment: 1,
                },
            },
        });

        return false;
    }

    // If the OTP is valid, mark it as verified and return true
    await prisma.verification.update({
        where: {
            id: otpRecord.id,
        },
        data: {
            verifiedAt: new Date(),
        },
    });

    return true;
}