"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { API_URL } from "@/lib/constants";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  // Retrieve token on mount
  React.useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const token = sessionStorage.getItem("soc_reset_token");
      if (!token) {
        setError("No valid reset session found. Please request a new password reset code.");
      } else {
        setResetToken(token);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!resetToken) {
      setError("Reset token is missing or expired. Please start over.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      // Cleanup token from storage
      sessionStorage.removeItem("soc_reset_token");
      sessionStorage.removeItem("soc_reset_email");

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <AuthCard
        title="Set New Password"
        subtitle="Choose a secure password for your campus marketplace account"
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

        {!resetToken && !success ? (
          <div className="text-center py-4">
            <Link href="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Reset Code
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              required
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || !!success}
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
              id="confirm-new-password"
              type={showPassword ? "text" : "password"}
              label="Confirm New Password"
              required
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !!success}
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!!success}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  );
}
