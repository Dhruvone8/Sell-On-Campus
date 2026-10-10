"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { API_URL } from "@/lib/constants";
import { ReportReason } from "@/lib/types";
import {
  AlertTriangle,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  sellerId?: string;
  listingTitle: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; desc: string }[] = [
  {
    value: "FRAUD",
    label: "Scam or Fraud",
    desc: "Deceptive payments, counterfeit item, or fake seller details.",
  },
  {
    value: "PROHIBITED_ITEM",
    label: "Prohibited Item",
    desc: "Weapons, alcohol, drugs, exams, or banned campus goods.",
  },
  {
    value: "MISLEADING_LISTING",
    label: "Misleading Info",
    desc: "Wrong condition, deceptive photos, or unrealistic price.",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    label: "Inappropriate Content",
    desc: "Explicit imagery, offensive language, or NSFW material.",
  },
  {
    value: "HARASSMENT",
    label: "Harassment",
    desc: "Threatening behavior, stalking, or abusive communication.",
  },
  {
    value: "OTHER",
    label: "Other Violation",
    desc: "Other breach of campus marketplace community guidelines.",
  },
];

export function ReportListingModal({
  isOpen,
  onClose,
  listingId,
  sellerId,
  listingTitle,
}: ReportListingModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [reason, setReason] = React.useState<ReportReason>("FRAUD");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const resetForm = () => {
    setReason("FRAUD");
    setDescription("");
    setError(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }

    if (description.trim().length > 0 && description.trim().length < 10) {
      setError("Please provide at least 10 characters in your description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Record<string, string> = {
        reason,
        listingId,
      };

      if (sellerId) {
        payload.reportedUserId = sellerId;
      }

      if (description.trim()) {
        payload.description = description.trim();
      }

      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      className="p-0 overflow-hidden w-full max-w-[560px]"
    >
      {isSuccess ? (
        <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 font-jakarta">
            Report Submitted
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm leading-relaxed">
            Thank you for helping keep our campus marketplace safe. Our moderation team has received your report and will review this listing shortly.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 overflow-hidden">
          {/* Header - Fixed & Non-shrinking */}
          <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-charcoal-100 flex items-start gap-3.5 pr-12 bg-white">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-500 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-charcoal-900 font-jakarta tracking-tight leading-snug">
                Report Listing
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5 truncate">
                Flagging <span className="font-semibold text-charcoal-800">&ldquo;{listingTitle}&rdquo;</span>
              </p>
            </div>
          </div>

          {/* Body Content - Scrollable independently, no nested scrollbars */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Reason Selection */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider font-jakarta">
                  Select a violation reason
                </label>
                <span className="text-[11px] text-charcoal-400 font-medium">Required</span>
              </div>

              {/* Responsive Cards - No internal scrollbar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REPORT_REASONS.map((item) => {
                  const isSelected = reason === item.value;
                  return (
                    <label
                      key={item.value}
                      className={cn(
                        "group relative flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-brand-50/70 border-brand-500 ring-1 ring-brand-500/30 shadow-xs"
                          : "bg-white border-charcoal-200/90 hover:bg-charcoal-50/80 hover:border-charcoal-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={item.value}
                        checked={isSelected}
                        onChange={() => setReason(item.value)}
                        className="sr-only"
                      />

                      {/* Custom Radio Button with Brand Orange Accent */}
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          isSelected
                            ? "border-brand-500 bg-brand-500 ring-2 ring-brand-500/20"
                            : "border-charcoal-300 bg-white group-hover:border-charcoal-400"
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className={cn(
                            "text-xs font-bold font-jakarta leading-snug",
                            isSelected ? "text-brand-950" : "text-charcoal-900"
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="text-[11px] text-charcoal-500 leading-normal">
                          {item.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Details Textarea */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reportDescription"
                  className="text-xs font-bold text-charcoal-800 font-jakarta flex items-center gap-1.5"
                >
                  <span>Additional Details</span>
                  <span className="font-normal text-charcoal-400 lowercase">(optional)</span>
                </label>
                <span className="text-[11px] text-charcoal-400 font-mono">
                  {description.length}/500
                </span>
              </div>

              <textarea
                id="reportDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share any helpful context for the admin team (e.g. seller asking for off-platform payment, damaged item concealed in photos)..."
                maxLength={500}
                rows={3}
                className="w-full rounded-2xl border border-charcoal-200/90 bg-white p-3.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none transition-all resize-none shadow-xs leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-charcoal-400">
                <span>Minimum 10 characters if you provide notes</span>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 text-xs text-charcoal-600">
              <Lock className="w-4 h-4 text-charcoal-500 shrink-0" />
              <span className="leading-normal">
                <strong>100% Anonymous.</strong> The seller will never see who filed this report.
              </span>
            </div>
          </div>

          {/* Footer Actions - Fixed & Non-shrinking */}
          <div className="shrink-0 p-4 sm:p-5 sm:px-6 bg-charcoal-50/70 border-t border-charcoal-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-200/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all shadow-sm shadow-brand-500/25 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
