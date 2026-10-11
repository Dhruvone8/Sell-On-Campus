/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Listing } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { formatPrice, cn } from "@/lib/utils";
import { getListingShareUrl, optimizeCloudinaryUrl } from "@/lib/constants";
import {
  Copy,
  Check,
  Share2,
  Mail,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";

export interface ShareListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export function ShareListingModal({
  isOpen,
  onClose,
  listing,
}: ShareListingModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [copiedNotification, setCopiedNotification] = React.useState<string | null>(null);
  const [shareUrl, setShareUrl] = React.useState("");
  const [canNativeShare, setCanNativeShare] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(getListingShareUrl(listing.id));
      setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
    }
  }, [listing.id]);

  React.useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setCopiedNotification(null);
      setImageError(false);
    }
  }, [isOpen]);

  const rawThumbnail = listing.images?.[0]?.imageUrl;
  const thumbnail = rawThumbnail ? optimizeCloudinaryUrl(rawThumbnail) : null;
  const priceDisplay = formatPrice(listing.price);
  const shareTitle = `Check out "${listing.title}" on SellOnCampus!`;
  const shareSummary = `Found this on SellOnCampus: ${listing.title} (${priceDisplay}). Safe peer-to-peer campus handoff:`;

  const copyToClipboard = async (customMessage?: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setCopiedNotification(customMessage || "Link copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: listing.title,
        text: `${listing.title} (${priceDisplay}) - SellOnCampus`,
        url: shareUrl,
      });
      onClose();
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Native share error:", err);
      }
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=620,height=620");
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      description: "Chat or groups",
      color: "bg-[#25D366] text-white hover:bg-[#20ba59] shadow-[#25D366]/20",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2C6.51 2 2.016 6.49 2.016 12.01c0 1.83.498 3.618 1.442 5.184L2 22l4.981-1.428A9.96 9.96 0 0012.03 22c5.522 0 10.016-4.49 10.016-10.01C22.046 6.49 17.553 2 12.031 2zm5.727 14.167c-.24.672-1.396 1.282-1.93 1.344-.498.058-1.127.085-3.376-.848-2.614-1.084-4.29-3.73-4.42-3.902-.13-.173-1.054-1.402-1.054-2.673 0-1.272.668-1.898.905-2.158.238-.26.519-.325.692-.325.174 0 .347.002.498.01.162.008.38.06.59.563.22.52.748 1.823.813 1.954.065.13.108.282.022.455-.087.173-.13.282-.26.433-.13.152-.27.34-.39.455-.13.13-.26.27-.11.53.15.26.67 1.1 1.44 1.785.99.88 1.82 1.153 2.08 1.282.26.13.41.11.56-.065.152-.173.65-.757.823-1.017.173-.26.347-.216.585-.13.238.086 1.517.714 1.777.844.26.13.433.195.498.303.065.108.065.628-.173 1.3z" />
        </svg>
      ),
      action: () => {
        const text = `${shareSummary}\n${shareUrl}`;
        openShareWindow(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
      },
    },
    {
      name: "X (Twitter)",
      description: "Post to timeline",
      color: "bg-black text-white hover:bg-neutral-800 shadow-black/20",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => {
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareSummary)}&url=${encodeURIComponent(shareUrl)}`
        );
      },
    },
    {
      name: "Telegram",
      description: "Send message",
      color: "bg-[#229ED9] text-white hover:bg-[#1f8fc4] shadow-[#229ED9]/20",
      icon: (
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .39z" />
        </svg>
      ),
      action: () => {
        openShareWindow(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareSummary)}`
        );
      },
    },
    {
      name: "Instagram",
      description: "Copy link for Story / DM",
      color: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-95 shadow-rose-500/20",
      icon: (
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      action: () => {
        copyToClipboard("Link copied! Paste into Instagram Story link sticker, Bio, or DM.");
      },
    },
    {
      name: "Facebook",
      description: "Share to feed",
      color: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-[#1877F2]/20",
      icon: (
        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => {
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
      },
    },
    {
      name: "LinkedIn",
      description: "Post update",
      color: "bg-[#0A66C2] text-white hover:bg-[#095196] shadow-[#0A66C2]/20",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      action: () => {
        openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
      },
    },
    {
      name: "Email",
      description: "Send via email",
      color: "bg-slate-700 text-white hover:bg-slate-800 shadow-slate-700/20",
      icon: <Mail className="w-4.5 h-4.5" />,
      action: () => {
        const mailto = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(
          `${shareSummary}\n\n${shareUrl}\n\nSafe peer handoff on campus with SellOnCampus!`
        )}`;
        window.location.href = mailto;
      },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share listing"
      description="Share this item with classmates or campus groups"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6 pt-3">
        {/* Product Snippet Preview Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-charcoal-200 shrink-0 border border-charcoal-200 flex items-center justify-center">
            {thumbnail && !imageError ? (
              <img
                src={thumbnail}
                alt={listing.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-6 h-6 text-charcoal-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 truncate">
              {listing.title}
            </h3>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-bold text-brand-600 font-jakarta">
                {priceDisplay}
              </span>
              {listing.category?.name && (
                <span className="text-[11px] text-charcoal-500 font-medium">
                  • {listing.category.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-400 truncate mt-0.5 flex items-center gap-1">
              <span>selloncampus.site</span>
            </p>
          </div>
        </div>

        {/* Informative notification message when link is copied / Instagram clicked */}
        {copiedNotification && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium animate-in fade-in-50 duration-150">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{copiedNotification}</span>
              {copiedNotification.includes("Instagram") && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700">
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold hover:text-emerald-900 inline-flex items-center gap-0.5"
                  >
                    <span>Open Instagram</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Social Channels Grid */}
        <div>
          <label className="block text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2.5">
            Share to
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
            {shareChannels.map((channel) => (
              <button
                key={channel.name}
                type="button"
                onClick={channel.action}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-charcoal-50/70 hover:bg-charcoal-100/90 border border-charcoal-200/70 hover:border-charcoal-300 transition-all group cursor-pointer active:scale-95"
                title={channel.description}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                    channel.color
                  )}
                >
                  {channel.icon}
                </div>
                <span className="text-[11px] font-semibold text-charcoal-700 group-hover:text-charcoal-900 mt-1.5 text-center leading-tight">
                  {channel.name}
                </span>
              </button>
            ))}

            {/* Native Share Sheet Button (if available) */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-charcoal-50/70 hover:bg-charcoal-100/90 border border-charcoal-200/70 hover:border-charcoal-300 transition-all group cursor-pointer active:scale-95"
                title="Open system share sheet"
              >
                <div className="w-10 h-10 rounded-xl bg-charcoal-800 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                  <Share2 className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-semibold text-charcoal-700 group-hover:text-charcoal-900 mt-1.5 text-center leading-tight">
                  More...
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Link Section */}
        <div>
          <label className="block text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-2">
            Or copy link
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={() => copyToClipboard()}
              className="w-full h-11 pl-3.5 pr-28 rounded-xl bg-charcoal-50/80 border border-charcoal-200 text-xs font-mono text-charcoal-700 truncate focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all select-all cursor-pointer"
            />
            <button
              type="button"
              onClick={() => copyToClipboard()}
              className={cn(
                "absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95",
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helpful peer note */}
        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400 pt-1 border-t border-charcoal-100">
          <Info className="w-3.5 h-3.5 shrink-0 text-charcoal-400" />
          <span>
            Shared links include photos, price, and campus handoff details automatically.
          </span>
        </div>
      </div>
    </Modal>
  );
}
