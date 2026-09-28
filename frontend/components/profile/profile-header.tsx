/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { UserProfile } from "@/lib/types";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import {
  ShieldCheck,
  GraduationCap,
  Calendar,
  Package,
  CheckCircle,
  Tag,
  Pencil,
  Building,
} from "lucide-react";

export interface ProfileHeaderProps {
  user: UserProfile;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  onEditClick: () => void;
}

export function ProfileHeader({
  user,
  totalListings,
  activeListings,
  soldListings,
  onEditClick,
}: ProfileHeaderProps) {
  const initials = getInitials(user.name || "Campus Student");

  return (
    <div className="bg-white rounded-3xl border border-charcoal-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          {/* Avatar Box */}
          <div className="relative shrink-0">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-50 border-2 border-brand-200/70 flex items-center justify-center text-brand-600 font-extrabold text-2xl sm:text-3xl font-jakarta shadow-inner">
                {initials}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white"
              title="Verified Student Account"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Text details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 font-jakarta tracking-tight">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                Verified Student
              </span>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-500 font-medium font-mono">
              {user.email}
            </p>

            {/* Department and Academic Year Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-charcoal-50 text-charcoal-700 border border-charcoal-200/80">
                <Building className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user.department || "General Campus"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-charcoal-50 text-charcoal-700 border border-charcoal-200/80">
                <GraduationCap className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>{user.year ? `Year ${user.year}` : "Student"}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs text-charcoal-400">
                <Calendar className="w-3 h-3 text-charcoal-400 shrink-0" />
                <span>Joined {formatRelativeTime(user.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Edit Button */}
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-700 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200/80 transition-all active:scale-[0.98] cursor-pointer shadow-2xs self-center sm:self-start shrink-0"
        >
          <Pencil className="w-3.5 h-3.5 text-brand-500" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-charcoal-100">
        <div className="bg-canvas rounded-2xl p-2.5 sm:p-4 text-center border border-charcoal-100">
          <div className="flex items-center justify-center gap-1 text-charcoal-400 mb-1">
            <Package className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Total Items
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-charcoal-900 font-jakarta">
            {totalListings}
          </p>
        </div>

        <div className="bg-canvas rounded-2xl p-2.5 sm:p-4 text-center border border-charcoal-100">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Active
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-emerald-700 font-jakarta">
            {activeListings}
          </p>
        </div>

        <div className="bg-canvas rounded-2xl p-2.5 sm:p-4 text-center border border-charcoal-100">
          <div className="flex items-center justify-center gap-1 text-charcoal-500 mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate">
              Sold
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-charcoal-700 font-jakarta">
            {soldListings}
          </p>
        </div>
      </div>
    </div>
  );
}
