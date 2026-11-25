/* eslint-disable @next/next/no-img-element */
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
  UploadCloud,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { API_URL } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { AvatarCropModal } from "./avatar-crop-modal";
import toast from "react-hot-toast";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SOURCE_FILE_BYTES = 10 * 1024 * 1024; // 10 MB pre-crop limit
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB backend limit

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

  // Profile Photo Upload & Crop State
  const [sourceFile, setSourceFile] = React.useState<File | null>(null);
  const [cropTargetFile, setCropTargetFile] = React.useState<File | null>(null);
  const [croppedFile, setCroppedFile] = React.useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = React.useState<{ file: File; url: string } | null>(null);
  const [removePhoto, setRemovePhoto] = React.useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = React.useState(false);
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const photoRevisionRef = React.useRef(0);

  // Read cropped File into a StrictMode-safe data URL for circular preview
  React.useEffect(() => {
    if (!croppedFile) return;

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setCroppedPreview({ file: croppedFile, url: reader.result });
      }
    };

    reader.readAsDataURL(croppedFile);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [croppedFile]);

  const croppedPreviewUrl =
    croppedFile && croppedPreview?.file === croppedFile ? croppedPreview.url : null;

  const activePreviewUrl = removePhoto
    ? null
    : croppedPreviewUrl || user.profileImageUrl || null;

  const handleSelectPhotoFile = (selectedFile: File) => {
    setSaveError(null);
    if (!ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
      const msg = "Only JPEG, PNG, and WebP image files are allowed.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    if (selectedFile.size > MAX_SOURCE_FILE_BYTES) {
      const msg = `"${selectedFile.name}" exceeds the 10MB selection limit.`;
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    setCropTargetFile(selectedFile);
  };

  const handleCropConfirmed = (cropped: File) => {
    if (cropped.size > MAX_UPLOAD_BYTES) {
      toast.error("Cropped image exceeds the 5MB upload limit. Please try a different image.");
      setCropTargetFile(null);
      return;
    }
    if (cropTargetFile) {
      setSourceFile(cropTargetFile);
    }
    photoRevisionRef.current += 1;
    setCroppedFile(cropped);
    setRemovePhoto(false);
    setCropTargetFile(null);
  };

  const handleRemovePhoto = () => {
    if (isSaving) return;
    photoRevisionRef.current += 1;
    setCroppedFile(null);
    setSourceFile(null);
    setRemovePhoto(true);
    setSaveSuccess(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!name.trim() || name.trim().length < 2) {
      const msg = "Name must be at least 2 characters long.";
      setSaveError(msg);
      toast.error(msg);
      return;
    }

    const submittedPhotoRevision = photoRevisionRef.current;

    try {
      setIsSaving(true);
      const apiUrl = API_URL;

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("department", department.trim());
      formData.append("year", year ? String(Number(year)) : "");

      if (croppedFile) {
        formData.append("image", croppedFile);
      } else if (removePhoto && user.profileImageUrl) {
        formData.append("removeProfileImage", "true");
      }

      const res = await fetch(`${apiUrl}/api/users/me`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (photoRevisionRef.current === submittedPhotoRevision) {
        setCroppedFile(null);
        setSourceFile(null);
        setRemovePhoto(false);
      }
      setSaveSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      if (data.user) {
        onProfileUpdated?.(data.user);
        await checkAuth();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error saving profile";
      setSaveError(errMsg);
      toast.error(errMsg);
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

          {/* Profile Photo Upload & Circular Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              Profile Photo (Optional)
            </label>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving}
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected && !isSaving) {
                  handleSelectPhotoFile(selected);
                }
                e.target.value = "";
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!isSaving) setIsDraggingPhoto(true);
              }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(false);
                if (isSaving) return;
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) {
                  handleSelectPhotoFile(dropped);
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDraggingPhoto
                  ? "border-brand-500 bg-brand-50/50"
                  : "border-charcoal-200/80 bg-charcoal-50/40"
              } ${isSaving ? "opacity-70" : ""}`}
            >
              {/* Circular Avatar Preview */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {activePreviewUrl ? (
                    <img
                      src={activePreviewUrl}
                      alt={name || user.name || "Profile photo preview"}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-brand-500/25 shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-brand-50 border-2 border-brand-200/70 flex items-center justify-center text-brand-600 font-extrabold text-xl font-jakarta shadow-inner">
                      {getInitials(name || user.name || "Student")}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => photoInputRef.current?.click()}
                    title="Upload profile photo"
                    aria-label="Upload profile photo"
                    className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-sm ring-2 ring-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-charcoal-900">
                    {croppedFile
                      ? "New photo ready to save"
                      : activePreviewUrl
                      ? "Avatar preview"
                      : "Upload a  profile photo"}
                  </p>
                  <p className="text-[11px] text-charcoal-500 leading-relaxed">
                    {croppedFile
                      ? "Click Save Profile below to update your photo."
                      : "Drag & drop or choose JPEG, PNG, or WebP (max 5MB). You can zoom and crop inside the circle."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => photoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-charcoal-800 bg-white hover:bg-charcoal-100 border border-charcoal-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-brand-500" />
                  <span>{activePreviewUrl ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {sourceFile && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setCropTargetFile(sourceFile)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal-700 bg-white hover:bg-charcoal-100 border border-charcoal-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Adjust</span>
                  </button>
                )}

                {activePreviewUrl && (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
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

      {/* Circular Photo Cropper Modal */}
      {cropTargetFile && (
        <AvatarCropModal
          file={cropTargetFile}
          onCancel={() => setCropTargetFile(null)}
          onConfirm={handleCropConfirmed}
        />
      )}
    </div>
  );
}
