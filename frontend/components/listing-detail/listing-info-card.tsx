"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Listing } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare, Loader2, Edit3, ShieldCheck, MapPin, Sparkles, Layers, Trash2, Flag } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Modal } from "@/components/ui/modal";
import { ReportListingModal } from "./report-listing-modal";

export interface ListingInfoCardProps {
  listing: Listing;
}

const CONDITION_META: Record<string, { label: string; badgeClass: string }> = {
  NEW: { label: "Brand New", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LIKE_NEW: { label: "Like New", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  GOOD: { label: "Good", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  FAIR: { label: "Fair", badgeClass: "bg-charcoal-100 text-charcoal-700 border-charcoal-200" },
};

export function ListingInfoCard({ listing }: ListingInfoCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isMessaging, setIsMessaging] = React.useState(false);
  const [messageError, setMessageError] = React.useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);

  const isOwner = Boolean(
    user && (user.id === listing.sellerId || user.id === listing.seller?.id)
  );

  const isSold = listing.status === "SOLD";
  const isReserved = listing.status === "RESERVED";

  const conditionInfo = listing.condition ? CONDITION_META[listing.condition] : null;

  const handleMessageSeller = async () => {
    if (isOwner) {
      return;
    }

    setMessageError(null);

    if (!isAuthenticated) {
      router.push(`/login?redirect=/listings/${listing.id}`);
      return;
    }

    try {
      setIsMessaging(true);
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ listingId: listing.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to start conversation");
      }

      const data = await res.json();
      const conversationId = data.conversation?.id;

      if (conversationId) {
        router.push(`/conversations?conversationId=${conversationId}`);
      } else {
        router.push("/conversations");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error contacting seller";
      setMessageError(msg);
      setIsMessaging(false);
    }
  };

  const handleDeleteListing = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const apiUrl = API_URL;
      const res = await fetch(`${apiUrl}/api/listings/${listing.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete listing");
      }

      router.push("/my-listings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete listing";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs flex flex-col gap-4">
      {/* Category Tag & Status Pill */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
          {listing.category?.name || "Marketplace"}
        </span>

        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
              <span>Your Listing</span>
            </span>
          )}

          {isSold ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-charcoal-100 text-charcoal-600 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-charcoal-500" />
              Sold
            </span>
          ) : isReserved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Reserved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          )}
        </div>
      </div>

      {/* Listing Title */}
      <h1 className="text-xl min-[360px]:text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight leading-snug font-jakarta">
        {listing.title}
      </h1>

      {/* Price & Condition */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
        <span className="text-2xl min-[360px]:text-3xl sm:text-4xl font-extrabold text-brand-600 tracking-tight leading-none font-jakarta">
          {formatPrice(listing.price)}
        </span>

        {conditionInfo && (
          <span
            className={cn(
              "px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs",
              conditionInfo.badgeClass
            )}
          >
            {conditionInfo.label}
          </span>
        )}
      </div>

      {/* Error message if chat initialization fails */}
      {messageError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {messageError}
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-2">
        {isOwner ? (
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href={`/listings/${listing.id}/edit`}
                className="w-full h-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Edit3 className="w-4 h-4 stroke-[2]" />
                <span>Edit Listing</span>
              </Link>
              <Link
                href="/my-listings"
                className="w-full h-11 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-charcoal-200/80 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Layers className="w-4 h-4 stroke-[2]" />
                <span>My Listings</span>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-red-200/80 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
              <span>Delete Listing</span>
            </button>
          </div>
        ) : isSold ? (
          <button
            type="button"
            disabled
            className="w-full h-12 rounded-xl bg-charcoal-100 text-charcoal-400 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>This item has been sold</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isMessaging}
            onClick={handleMessageSeller}
            className="w-full h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
          >
            {isMessaging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting to Chat...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                <span>Message Seller</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Safety & Community Trust Row */}
      <div className="pt-4 border-t border-charcoal-100 grid grid-cols-1 gap-2.5 text-xs text-charcoal-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Verified campus email student seller</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Direct in-person campus pickup and inspection</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Zero buyer fees • Direct student-to-student deal</span>
        </div>
      </div>

      {/* Report Listing Trigger for non-owners */}
      {!isOwner && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-rose-600 transition-colors cursor-pointer group py-1 px-2 rounded-lg hover:bg-rose-50/60"
          >
            <Flag className="w-3.5 h-3.5 group-hover:text-rose-600 transition-colors" />
            <span>Report this listing</span>
          </button>
        </div>
      )}

      {/* Report Listing Modal */}
      <ReportListingModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        listingId={listing.id}
        sellerId={listing.sellerId || listing.seller?.id}
        listingTitle={listing.title}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Listing"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-charcoal-900">&ldquo;{listing.title}&rdquo;</span>? This will permanently remove the listing, photos, and any conversations associated with it. This action cannot be undone.
          </p>

          {deleteError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {deleteError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteListing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
