"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

type Step = "EMAIL" | "OTP";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("EMAIL");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Step 1: Request Password Reset OTP
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your college email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send password reset code.");
        return;
      }

      setSuccess("Reset code sent! Please check your email inbox.");
      setStep("OTP");
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify Password Reset OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid or expired reset code.");
        return;
      }

      const resetToken = data.resetToken;
      if (!resetToken) {
        setError("Failed to retrieve reset authorization. Please try again.");
        return;
      }

      // Store token temporarily in sessionStorage for reset page
      sessionStorage.setItem("soc_reset_token", resetToken);
      sessionStorage.setItem("soc_reset_email", email.trim().toLowerCase());

      setSuccess("Code verified! Redirecting to set your new password...");
      setTimeout(() => {
        router.push("/reset-password");
      }, 500);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Resend code
  async function handleResend() {
    setError("");
    setResending(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to resend code.");
        return;
      }
      setSuccess("A fresh reset code has been sent to your email.");
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title={step === "EMAIL" ? "Forgot Password" : "Enter Verification Code"}
        subtitle={
          step === "EMAIL"
            ? "Enter your registered campus email and we will send a 4-digit reset code"
            : `Enter the 4-digit code sent to ${email}`
        }
        footer={
          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        }
      >
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        {step === "EMAIL" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              id="forgot-email"
              type="email"
              label="College Email"
              required
              autoComplete="email"
              placeholder="you@vit.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Send Reset Code
            </Button>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                4-Digit Reset Code
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={otp.length !== 4}
              className="w-full"
            >
              Verify Code & Continue
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setOtp("");
                  setError("");
                }}
                className="flex items-center gap-1 text-charcoal-500 hover:text-charcoal-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change email
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-bold text-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
