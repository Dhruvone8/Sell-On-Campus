"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Listing, ListingStatus, UserProfile } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ProfileHeader } from "@/components/profile/profile-header";
import { AccountSettings } from "@/components/profile/account-settings";
import { MyListingCard } from "@/components/my-listings/my-listing-card";
import {
  Package,
  Settings,
  PlusCircle,
  Loader2,
  LogIn,
  AlertCircle,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileTab = "LISTINGS" | "SETTINGS";
type ListingFilter = "ALL" | "ACTIVE" | "RESERVED" | "SOLD";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<ProfileTab>("LISTINGS");
  const [listingFilter, setListingFilter] = React.useState<ListingFilter>("ALL");

  // Fetch real user profile and user listings
  const loadProfileData = React.useCallback(async () => {
    try {
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch user profile
      const userRes = await fetch(`${apiUrl}/api/users/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!userRes.ok) {
        if (userRes.status === 401) {
          setError("You must be logged in to access your profile.");
          return;
        }
        throw new Error("Failed to load user profile");
      }

      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Fetch user's listings
      const listingsRes = await fetch(`${apiUrl}/api/listings/me?limit=50`, {
        method: "GET",
        credentials: "include",
      });

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(Array.isArray(listingsData.listings) ? listingsData.listings : []);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error loading profile";
      setError(errMsg);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function init() {
      await Promise.resolve();
      if (!isMounted) return;

      if (!isAuthLoading) {
        if (isAuthenticated) {
          setIsLoadingData(true);
          await loadProfileData();
        } else {
          setIsLoadingData(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, loadProfileData]);

  // Handle live status toggle for listings
  const handleStatusChange = (listingId: string, newStatus: ListingStatus) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Filtered listings
  const filteredListings = React.useMemo(() => {
    if (listingFilter === "ALL") return listings;
    return listings.filter((item) => item.status === listingFilter);
  }, [listings, listingFilter]);

  // Counts
  const counts = React.useMemo(() => {
    return {
      ALL: listings.length,
      ACTIVE: listings.filter((l) => l.status === "ACTIVE").length,
      RESERVED: listings.filter((l) => l.status === "RESERVED").length,
      SOLD: listings.filter((l) => l.status === "SOLD").length,
    };
  }, [listings]);

  // Loading state
  if (isAuthLoading || (isAuthenticated && isLoadingData)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-charcoal-600">
          Loading student profile...
        </p>
      </div>
    );
  }

  // Unauthenticated prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-500">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-charcoal-900 font-jakarta">
              Sign In to View Profile
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              Log in with your verified campus credentials to view and manage your account, active marketplace listings, and security settings.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/login?redirect=/profile")}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 transition-all cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load profile</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Header */}
        {user && (
          <ProfileHeader
            user={user}
            totalListings={counts.ALL}
            activeListings={counts.ACTIVE}
            soldListings={counts.SOLD}
            onEditClick={() => setActiveTab("SETTINGS")}
          />
        )}

        {/* Main Profile Tabs */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-charcoal-200/80 pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("LISTINGS")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                activeTab === "LISTINGS"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white"
              )}
            >
              <Package className="w-4 h-4" />
              <span>My Listings ({counts.ALL})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SETTINGS")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                activeTab === "SETTINGS"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900 hover:bg-white"
              )}
            >
              <Settings className="w-4 h-4" />
              <span>Account & Security</span>
            </button>
          </div>

          {/* Tab 1: Embedded Listings Management */}
          {activeTab === "LISTINGS" && (
            <div className="space-y-6">
              {/* Secondary Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-charcoal-200/80 shadow-2xs overflow-x-auto no-scrollbar">
                  {(
                    [
                      { id: "ALL", label: "All" },
                      { id: "ACTIVE", label: "Active" },
                      { id: "RESERVED", label: "Reserved" },
                      { id: "SOLD", label: "Sold" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setListingFilter(tab.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                        listingFilter === tab.id
                          ? "bg-charcoal-900 text-white"
                          : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
                      )}
                    >
                      <span>{tab.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-inherit">
                        {counts[tab.id]}
                      </span>
                    </button>
                  ))}
                </div>

                <Link
                  href="/listings/create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-2xs self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Item</span>
                </Link>
              </div>

              {/* Items Stream */}
              {filteredListings.length > 0 ? (
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <MyListingCard
                      key={listing.id}
                      listing={listing}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white rounded-3xl border border-charcoal-200/80 p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-charcoal-50 flex items-center justify-center mx-auto text-charcoal-400">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal-900 font-jakarta">
                    {listingFilter === "ALL"
                      ? "No listings posted yet"
                      : `No ${listingFilter.toLowerCase()} listings`}
                  </h3>
                  <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                    {listingFilter === "ALL"
                      ? "Start selling your unused college books, electronics, or hostel accessories to campus peers."
                      : `You do not have any items marked as ${listingFilter.toLowerCase()}.`}
                  </p>
                  {listingFilter === "ALL" && (
                    <div className="pt-2">
                      <Link
                        href="/listings/create"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create First Listing</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Account & Security */}
          {activeTab === "SETTINGS" && user && (
            <AccountSettings
              user={user}
              onProfileUpdated={(updated) => setUser(updated)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
