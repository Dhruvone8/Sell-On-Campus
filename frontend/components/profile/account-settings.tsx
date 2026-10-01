"use client";

import * as React from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  KeyRound,
  LogOut,
  ShieldCheck,
  Building,
  GraduationCap,
  User,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
} from "lucide-react";

export interface AccountSettingsProps {
  user: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export function AccountSettings({ user, onProfileUpdated }: AccountSettingsProps) {
  const { logout, checkAuth } = useAuth();

  // Form State
  const [name, setName] = React.useState(user.name || "");
  const [department, setDepartment] = React.useState(user.department || "");
  const [year, setYear] = React.useState(user.year ? String(user.year) : "");
  const [profileImageUrl, setProfileImageUrl] = React.useState(
    user.profileImageUrl || ""
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!name.trim() || name.trim().length < 2) {
      setSaveError("Name must be at least 2 characters long.");
      return;
    }

    try {
      setIsSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const payload: {
        name: string;
        department?: string | null;
        year?: number | null;
        profileImageUrl?: string | null;
      } = {
        name: name.trim(),
        department: department.trim() || null,
        year: year ? Number(year) : null,
        profileImageUrl: profileImageUrl.trim() || null,
      };

      const res = await fetch(`${apiUrl}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSaveSuccess("Profile updated successfully!");
      if (data.user) {
        onProfileUpdated?.(data.user);
        await checkAuth();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error saving profile";
      setSaveError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Profile Information Edit Card */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 p-4 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-charcoal-100">
          <span className="p-2 rounded-xl bg-brand-50 text-brand-500">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 font-jakarta">
              Student Details
            </h2>
            <p className="text-xs text-charcoal-500">
              Update your name, academic department, and study year.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              Campus Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-charcoal-500 text-xs font-mono select-none cursor-not-allowed"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-[11px] text-charcoal-400">
              Campus emails cannot be changed once verified.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              Full Name <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
          </div>

          {/* Department & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="text"
                  maxLength={50}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
                Academic Year
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all bg-white"
                >
                  <option value="">Select Year (Optional)</option>
                  <option value="1">1st Year (Freshman)</option>
                  <option value="2">2nd Year (Sophomore)</option>
                  <option value="3">3rd Year (Junior)</option>
                  <option value="4">4th Year (Senior)</option>
                  <option value="5">5th Year (Dual / Masters)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              Profile Photo URL (Optional)
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or image link"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Password Section */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 p-4 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-charcoal-100">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <KeyRound className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-charcoal-900 font-jakarta">
              Security &amp; Authentication
            </h2>
            <p className="text-xs text-charcoal-500">
              Manage credentials and account recovery options.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-100">
          <div className="space-y-1">
            <p className="text-xs font-bold text-charcoal-900">Account Password</p>
            <p className="text-[11px] text-charcoal-500 leading-relaxed max-w-md">
              Password is encrypted with Argon2. To change or reset your password, you will receive a secure OTP code at your registered email address.
            </p>
          </div>

          <Link
            href="/forgot-password"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-800 bg-white hover:bg-charcoal-100 border border-charcoal-200 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      {/* 3. Account Actions & Logout */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 p-4 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-charcoal-900">Sign Out of Session</p>
          <p className="text-[11px] text-charcoal-500">
            Clears your authentication tokens and securely ends your session on this device.
          </p>
        </div>

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all cursor-pointer shadow-2xs self-start sm:self-auto disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
