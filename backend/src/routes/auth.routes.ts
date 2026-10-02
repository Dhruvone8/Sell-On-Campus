import { Router } from "express";
import {
    requestRegistrationOtp, verifyRegistrationOtp, register, login, refreshAccessToken, logout,
    requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword
} from "../controllers/auth.controller.js";
import { authRateLimiters } from "../utils/rate-limit.util.js";

const router = Router();

router.post("/register/request-otp", authRateLimiters.otpRequest, requestRegistrationOtp);
router.post("/register/verify-otp", authRateLimiters.otpVerify, verifyRegistrationOtp);
router.post("/register", register);
router.post("/login", authRateLimiters.login, login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/forgot-password", authRateLimiters.forgotPassword, requestPasswordResetOtp);
router.post("/forgot-password/verify-otp", authRateLimiters.forgotPasswordVerify, verifyPasswordResetOtp);
router.post("/reset-password", authRateLimiters.resetPassword, resetPassword);

export default router;