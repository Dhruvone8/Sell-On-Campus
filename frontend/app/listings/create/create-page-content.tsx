"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { CreateListingForm } from "@/components/create-listing";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CreatePageContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-pulse">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-charcoal-200/70 shadow-xs flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 stroke-[1.5]" />
          </div>

          <h1 className="text-2xl font-bold text-charcoal-900 font-jakarta">
            Sign In to Sell
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2 leading-relaxed">
            SellOnCampus is a verified peer-to-peer student marketplace. Please sign in or register with your college email to post a listing.
          </p>

          <div className="w-full mt-6 space-y-2.5">
            <Link
              href="/login?redirect=/listings/create"
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 stroke-[2]" />
              <span>Sign In with College Email</span>
            </Link>

            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-800 font-semibold text-sm border border-charcoal-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2]" />
              <span>Create New Student Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-3">
          <span>0% Platform Fees • 100% Student Kept</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight font-jakarta">
          Post a Campus Listing
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 mt-1.5">
          Turn your textbooks, tech, and dorm essentials into cash. Connect with students across your campus.
        </p>
      </div>

      {/* Main Form */}
      <CreateListingForm />
    </div>
  );
}
