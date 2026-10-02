"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Listing } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { EditListingForm } from "@/components/my-listings/edit-listing-form";
import { Loader2, ArrowLeft, AlertCircle, LogIn, ShieldAlert } from "lucide-react";
import { API_URL } from "@/lib/constants";

export function EditListingContent({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [listing, setListing] = React.useState<Listing | null>(null);
  const [isLoadingListing, setIsLoadingListing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isNotOwner, setIsNotOwner] = React.useState(false);

  // Fetch listing data
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      await Promise.resolve();
      if (!isMounted) return;

      try {
        setIsLoadingListing(true);
        setError(null);
        setIsNotOwner(false);

        const apiUrl = API_URL;

        // 1. Fetch listing details
        const res = await fetch(`${apiUrl}/api/listings/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Listing not found. It may have been deleted.");
          }
          throw new Error("Failed to load listing details.");
        }

        const data = await res.json();
        const foundListing: Listing = data.listing;
        if (!isMounted) return;
        setListing(foundListing);

        // 2. Check ownership against user's listings
        if (isAuthenticated) {
          try {
            const myListingsRes = await fetch(`${apiUrl}/api/listings/me?limit=100`, {
              method: "GET",
              credentials: "include",
            });
            if (myListingsRes.ok && isMounted) {
              const myData = await myListingsRes.json();
              const myListingIds = Array.isArray(myData.listings)
                ? myData.listings.map((l: Listing) => l.id)
                : [];
              if (!myListingIds.includes(foundListing.id)) {
                setIsNotOwner(true);
              }
            }
          } catch {
            // Non-critical check failure; backend PATCH handles strict authorization
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errMsg = err instanceof Error ? err.message : "Error loading listing";
        setError(errMsg);
      } finally {
        if (isMounted) {
          setIsLoadingListing(false);
        }
      }
    }

    if (!isAuthLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, isAuthLoading, isAuthenticated]);

  // Loading state
  if (isAuthLoading || isLoadingListing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-charcoal-600">
          Loading listing for editing...
        </p>
      </div>
    );
  }

  // Not logged in gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-500">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-charcoal-900 font-jakarta">
              Sign In to Edit
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              You must be signed in with the seller account that created this listing
              to edit its details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/login?redirect=/listings/${id}/edit`)}
            className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Error or Not Found
  if (error || !listing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-charcoal-900 font-jakarta">
              Listing Unavailable
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              {error || "Could not retrieve the requested listing."}
            </p>
          </div>
          <Link
            href="/my-listings"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-bold text-sm bg-charcoal-900 hover:bg-charcoal-800 text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not owner check
  if (isNotOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-charcoal-900 font-jakarta">
              Not Authorized
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              You are signed in as a different student. Only the student who created
              this listing can edit it.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/listings/${id}`}
              className="w-full py-3 px-5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white transition-all text-center"
            >
              View Public Listing
            </Link>
            <Link
              href="/my-listings"
              className="w-full py-2.5 px-5 rounded-xl font-semibold text-sm text-charcoal-700 hover:bg-charcoal-100 transition-all text-center"
            >
              Go to My Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-charcoal-500">
          <Link
            href="/my-listings"
            className="hover:text-brand-600 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Listings</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-semibold line-clamp-1 max-w-[200px]">
            {listing.title}
          </span>
          <span>/</span>
          <span className="text-brand-600 font-bold">Edit</span>
        </div>

        {/* Page Title */}
        <div className="pb-4 border-b border-charcoal-200/70">
          <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 font-jakarta tracking-tight">
            Edit Listing
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Update pricing, description, category, and specifications for your campus listing.
          </p>
        </div>

        {/* Form Container */}
        <EditListingForm listing={listing} />
      </div>
    </div>
  );
}
