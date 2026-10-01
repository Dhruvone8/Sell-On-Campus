"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Listing, ListingStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { MyListingCard } from "@/components/my-listings/my-listing-card";
import {
  PlusCircle,
  Package,
  Search,
  Loader2,
  LogIn,
  AlertCircle,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabFilter = "ALL" | "ACTIVE" | "RESERVED" | "SOLD";

export default function MyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const [activeTab, setActiveTab] = React.useState<TabFilter>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch student's listings from backend
  const fetchMyListings = React.useCallback(async () => {
    try {
      setFetchError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/listings/me?limit=50`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        setFetchError("You must be logged in to view your listings.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load listings");
      }

      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error loading listings";
      setFetchError(errMsg);
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function init() {
      await Promise.resolve();
      if (!isMounted) return;

      if (!isAuthLoading) {
        if (isAuthenticated) {
          setIsLoadingListings(true);
          await fetchMyListings();
        } else {
          setIsLoadingListings(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, isAuthenticated, fetchMyListings]);

  // Handle live status update in local state
  const handleStatusChange = (listingId: string, newStatus: ListingStatus) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Filter listings
  const filteredListings = React.useMemo(() => {
    return listings.filter((item) => {
      // Tab filter
      if (activeTab !== "ALL" && item.status !== activeTab) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category?.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [listings, activeTab, searchQuery]);

  // Tab count calculations
  const counts = React.useMemo(() => {
    return {
      ALL: listings.length,
      ACTIVE: listings.filter((l) => l.status === "ACTIVE").length,
      RESERVED: listings.filter((l) => l.status === "RESERVED").length,
      SOLD: listings.filter((l) => l.status === "SOLD").length,
    };
  }, [listings]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-charcoal-600">
          Checking campus authorization...
        </p>
      </div>
    );
  }

  // Unauthenticated gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-500">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-charcoal-900 font-jakarta">
              Sign In to View My Listings
            </h1>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              Log in with your verified campus email to manage your items, update prices,
              mark items reserved, or confirm completed sales.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/login?redirect=/my-listings")}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-800 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pt-8 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-charcoal-200/70">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-brand-50 text-brand-500 border border-brand-100">
                <Package className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 font-jakarta tracking-tight">
                My Listings
              </h1>
            </div>
            <p className="text-sm text-charcoal-500">
              Manage all your items, change reservation statuses, or edit details.
            </p>
          </div>

          <Link
            href="/listings/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.99] shadow-md shadow-brand-500/25 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>

        {/* Filter Controls: Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tab Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-charcoal-200/80 shadow-2xs overflow-x-auto no-scrollbar">
            {(
              [
                { id: "ALL", label: "All Items" },
                { id: "ACTIVE", label: "Active" },
                { id: "RESERVED", label: "Reserved" },
                { id: "SOLD", label: "Sold" },
              ] as const
            ).map((tab) => {
              const count = counts[tab.id];
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-3.5 py-2 min-h-[36px] rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none",
                    isSelected
                      ? "bg-brand-500 text-white shadow-xs"
                      : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-charcoal-100 text-charcoal-600"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your listings..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Error Display */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load listings</p>
              <p className="text-xs mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {isLoadingListings ? (
          <div className="py-20 flex flex-col items-center justify-center text-charcoal-500">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
            <p className="text-sm font-medium">Fetching your listings...</p>
          </div>
        ) : filteredListings.length > 0 ? (
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
          /* Empty States */
          <div className="bg-white rounded-3xl border border-charcoal-200/80 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto text-brand-500">
              <Tag className="w-8 h-8 opacity-70" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-charcoal-900 font-jakarta">
                {searchQuery
                  ? "No matching listings found"
                  : activeTab === "ALL"
                  ? "You haven't posted any listings yet"
                  : `No ${activeTab.toLowerCase()} listings`}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500">
                {searchQuery
                  ? `No items matched "${searchQuery}". Try a different keyword.`
                  : activeTab === "ALL"
                  ? "Sell textbooks, bicycles, calculators, or hostel essentials to students on campus."
                  : `You currently have no listings in the ${activeTab.toLowerCase()} state.`}
              </p>
            </div>

            {activeTab === "ALL" && !searchQuery && (
              <div className="pt-2">
                <Link
                  href="/listings/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Your First Listing</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
