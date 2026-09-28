"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";

type Step = "EMAIL" | "OTP" | "PROFILE";

export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const [step, setStep] = React.useState<Step>("EMAIL");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Step 1: Request OTP
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
      const response = await fetch(`${apiUrl}/api/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send registration OTP.");
        return;
      }

      setSuccess("Verification OTP sent! Please check your campus inbox.");
      setStep("OTP");
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid or expired OTP code.");
        return;
      }

      setSuccess("Email successfully verified! Create your password to finish.");
      setStep("PROFILE");
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP handler
  async function handleResendOtp() {
    setError("");
    setResending(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }

      setSuccess("A fresh code has been sent to your email.");
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  // Step 3: Complete Registration
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account successfully created! Directing to marketplace...");
      await checkAuth();

      setTimeout(() => {
        router.push("/listings");
        router.refresh();
      }, 600);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title={
          step === "EMAIL"
            ? "Create an Account"
            : step === "OTP"
            ? "Verify Campus Email"
            : "Complete Your Profile"
        }
        subtitle={
          step === "EMAIL"
            ? "Connect with fellow students by verifying your college email"
            : step === "OTP"
            ? `Enter the 4-digit code sent to ${email}`
            : "Set your name and password to start buying and selling"
        }
        footer={
          <p className="text-center text-sm text-charcoal-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        }
      >
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "EMAIL"
                  ? "bg-brand-500 text-white"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {step !== "EMAIL" ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </span>
            <span className="text-xs font-semibold text-charcoal-700">Email</span>
          </div>

          <div className="h-0.5 w-8 bg-charcoal-200" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "OTP"
                  ? "bg-brand-500 text-white"
                  : step === "PROFILE"
                  ? "bg-emerald-500 text-white"
                  : "bg-charcoal-100 text-charcoal-500"
              }`}
            >
              {step === "PROFILE" ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </span>
            <span className="text-xs font-semibold text-charcoal-700">Code</span>
          </div>

          <div className="h-0.5 w-8 bg-charcoal-200" />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === "PROFILE"
                  ? "bg-brand-500 text-white"
                  : "bg-charcoal-100 text-charcoal-500"
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-charcoal-700">Profile</span>
          </div>
        </div>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        {/* STEP 1: Enter Email */}
        {step === "EMAIL" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              id="register-email"
              type="email"
              label="College Email"
              required
              autoComplete="email"
              placeholder="you@vitstudent.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              leftIcon={<Mail className="h-4 w-4" />}
              helperText="Only verified student email domains are accepted"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Continue with OTP
            </Button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                4-Digit Verification Code
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
              Verify Code
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
                onClick={handleResendOtp}
                disabled={resending}
                className="font-bold text-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Complete Profile */}
        {step === "PROFILE" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="register-name"
              type="text"
              label="Full Name"
              required
              autoComplete="name"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              label="Password (min 6 characters)"
              required
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Complete Registration
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
