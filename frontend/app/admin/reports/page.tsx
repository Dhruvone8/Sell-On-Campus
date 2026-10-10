"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { API_URL } from "@/lib/constants";
import {
  ReportSummary,
  ReportDetail,
  ReportReason,
  ReportStatus,
  ReportAction,
} from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  User,
  Package,
  Loader2,
  ChevronRight,
} from "lucide-react";

const REASON_CONFIG: Record<
  ReportReason,
  { label: string; bg: string; text: string; border: string }
> = {
  FRAUD: {
    label: "Fraud / Scam",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  PROHIBITED_ITEM: {
    label: "Prohibited Item",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  INAPPROPRIATE_CONTENT: {
    label: "Inappropriate Content",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  MISLEADING_LISTING: {
    label: "Misleading Listing",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  HARASSMENT: {
    label: "Harassment",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  OTHER: {
    label: "Other Violation",
    bg: "bg-charcoal-100",
    text: "text-charcoal-700",
    border: "border-charcoal-200",
  },
};

export default function AdminReportsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [reports, setReports] = React.useState<ReportSummary[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | "ALL">("PENDING");
  const [reasonFilter, setReasonFilter] = React.useState<ReportReason | "ALL">("ALL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Selected report for review modal
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null);
  const [reportDetail, setReportDetail] = React.useState<ReportDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  // Resolution state
  const [actionChoice, setActionChoice] = React.useState<ReportAction>("WARNING_ISSUED");
  const [notes, setNotes] = React.useState("");
  const [isResolving, setIsResolving] = React.useState(false);
  const [resolveSuccess, setResolveSuccess] = React.useState(false);

  // Effect to load reports
  React.useEffect(() => {
    let cancelled = false;

    if (isAuthLoading || !isAuthenticated || user?.role !== "ADMIN") {
      return;
    }

    const loadReports = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");

        if (statusFilter !== "ALL") {
          params.set("status", statusFilter);
        }
        if (reasonFilter !== "ALL") {
          params.set("reason", reasonFilter);
        }

        const res = await fetch(`${API_URL}/api/reports?${params.toString()}`, {
          credentials: "include",
        });

        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Admin access required.");
          }
          throw new Error("Failed to load reports");
        }

        const data = await res.json();
        if (!cancelled) {
          setReports(data.reports || []);
          setTotal(data.pagination?.total || 0);
          setTotalPages(data.pagination?.totalPages || 1);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading reports");
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, user, page, statusFilter, reasonFilter, refreshKey]);

  // Fetch single report detail
  const openReportDetail = async (id: string) => {
    setSelectedReportId(id);
    setIsLoadingDetail(true);
    setDetailError(null);
    setResolveSuccess(false);
    setNotes("");

    try {
      const res = await fetch(`${API_URL}/api/reports/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load report details");
      }

      const data = await res.json();
      setReportDetail(data.report);

      // Default action recommendation
      if (data.report.listing) {
        setActionChoice("LISTING_REMOVED");
      } else {
        setActionChoice("WARNING_ISSUED");
      }
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : "Error loading report detail");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeReportDetail = () => {
    if (isResolving) return;
    setSelectedReportId(null);
    setReportDetail(null);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    try {
      setIsResolving(true);
      setDetailError(null);

      const res = await fetch(`${API_URL}/api/reports/${selectedReportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: actionChoice,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to resolve report");
      }

      setResolveSuccess(true);
      setRefreshKey((k) => k + 1);

      // Close after brief visual confirmation
      setTimeout(() => {
        closeReportDetail();
      }, 1200);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : "Failed to resolve report");
    } finally {
      setIsResolving(false);
    }
  };

  // Auth Protection Render
  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-charcoal-500 font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-charcoal-900 font-jakarta">Admin Access Required</h1>
        <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
          The Moderation Queue is restricted to verified campus administrators. If you believe this is an error, please contact university administration.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold hover:bg-charcoal-800 transition-colors"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50/50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-charcoal-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider font-jakarta">
                Admin Portal
              </span>
              <span className="text-xs text-charcoal-500 font-medium">
                {total} total report{total === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight font-jakarta mt-1">
              Moderation Queue
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Review flagged items, issue warnings, and take direct moderation action.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRefreshKey((k) => k + 1);
            }}
            disabled={isLoading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-charcoal-200 text-xs font-semibold text-charcoal-700 hover:bg-charcoal-50 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-charcoal-200 rounded-xl shadow-xs self-start">
            {(["PENDING", "RESOLVED", "ALL"] as const).map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-jakarta ${
                    isActive
                      ? "bg-brand-500 text-white shadow-xs"
                      : "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100"
                  }`}
                >
                  {tab === "PENDING" ? "Pending Queue" : tab === "RESOLVED" ? "Resolved" : "All Reports"}
                </button>
              );
            })}
          </div>

          {/* Reason Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Filter className="w-4 h-4 text-charcoal-400" />
            <select
              value={reasonFilter}
              onChange={(e) => {
                setIsLoading(true);
                setReasonFilter(e.target.value as ReportReason | "ALL");
                setPage(1);
              }}
              className="text-xs bg-white border border-charcoal-200 rounded-xl px-3 py-2 text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Reasons</option>
              <option value="FRAUD">Fraud / Scam</option>
              <option value="PROHIBITED_ITEM">Prohibited Item</option>
              <option value="MISLEADING_LISTING">Misleading Listing</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="OTHER">Other Violation</option>
            </select>
          </div>
        </div>

        {/* Reports Table / Grid */}
        <div className="mt-6 bg-white rounded-2xl border border-charcoal-200/80 shadow-xs overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-medium border-b border-red-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-charcoal-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <span className="text-xs font-medium">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-charcoal-900 font-jakarta">
                No reports found
              </h3>
              <p className="text-xs text-charcoal-500 mt-1 max-w-sm">
                {statusFilter === "PENDING"
                  ? "Great job! All pending reports have been addressed."
                  : "No reports match the currently selected filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-charcoal-50/80 border-b border-charcoal-200/80 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider font-jakarta">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Reported Target</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {reports.map((report) => {
                    const reasonMeta = REASON_CONFIG[report.reason] || REASON_CONFIG.OTHER;
                    const dateFormatted = new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-charcoal-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-charcoal-500 whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${reasonMeta.bg} ${reasonMeta.text} ${reasonMeta.border}`}
                          >
                            {reasonMeta.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {report.listing ? (
                            <div className="flex items-center gap-2 max-w-xs truncate">
                              <Package className="w-4 h-4 text-brand-500 shrink-0" />
                              <span className="font-semibold text-charcoal-900 truncate">
                                {report.listing.title}
                              </span>
                            </div>
                          ) : report.reportedUser ? (
                            <div className="flex items-center gap-2 max-w-xs truncate">
                              <User className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="font-semibold text-charcoal-900 truncate">
                                {report.reportedUser.name} ({report.reportedUser.email})
                              </span>
                            </div>
                          ) : (
                            <span className="text-charcoal-400 italic">Unknown target</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-charcoal-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-charcoal-900">{report.reporter.name}</span>
                            <span className="text-[10px] text-charcoal-400">{report.reporter.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {report.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{report.actionTaken ? report.actionTaken.replace(/_/g, " ") : "Resolved"}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => openReportDetail(report.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-charcoal-100 hover:bg-brand-50 hover:text-brand-600 text-charcoal-700 font-bold transition-all text-xs cursor-pointer"
                          >
                            <span>{report.status === "PENDING" ? "Review" : "View"}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((p) => Math.max(p - 1, 1));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white hover:bg-charcoal-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((p) => Math.min(p + 1, totalPages));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white hover:bg-charcoal-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review & Resolution Modal */}
      <Modal
        isOpen={Boolean(selectedReportId)}
        onClose={closeReportDetail}
        maxWidth="xl"
        className="p-0 overflow-hidden w-full max-w-2xl max-h-[90dvh]"
      >
        {isLoadingDetail ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <span className="text-xs font-semibold text-charcoal-600 font-jakarta">Loading report context...</span>
          </div>
        ) : detailError ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{detailError}</span>
            </div>
          </div>
        ) : reportDetail ? (
          <form onSubmit={handleResolve} className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header - Fixed & Non-shrinking */}
            <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-charcoal-100 flex items-start gap-3.5 pr-12 bg-white">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-charcoal-900 font-jakarta tracking-tight leading-snug">
                    Report Review
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-charcoal-100 text-charcoal-700 font-bold border border-charcoal-200">
                    #{reportDetail.id.slice(0, 8)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      reportDetail.status === "RESOLVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : reportDetail.status === "REVIEWED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {reportDetail.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5 truncate">
                  Inspect submitted evidence and take moderation action
                </p>
              </div>
            </div>

            {/* Scrollable Body - independent scroll, bounded by 90dvh, never clips */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
              {/* Top row: Allegation info vs Target Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Allegation Details */}
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider font-jakarta flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Report Allegation</span>
                  </h4>

                  <div>
                    <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Reason
                    </span>
                    <div className="mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                          REASON_CONFIG[reportDetail.reason].bg,
                          REASON_CONFIG[reportDetail.reason].text,
                          REASON_CONFIG[reportDetail.reason].border
                        )}
                      >
                        {REASON_CONFIG[reportDetail.reason].label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Student Description
                    </span>
                    <div className="mt-1 text-xs text-charcoal-800 bg-white p-3 rounded-xl border border-charcoal-200/70 leading-relaxed italic">
                      {reportDetail.description ? `“${reportDetail.description}”` : <span className="text-charcoal-400 not-italic">No written description provided.</span>}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-charcoal-200/70 text-[11px] text-charcoal-500 flex flex-col gap-1 mt-auto">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3 h-3 text-charcoal-400 shrink-0" />
                      <span><strong>Filed by:</strong> {reportDetail.reporter.name} ({reportDetail.reporter.email})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-charcoal-400 shrink-0" />
                      <span><strong>Filed on:</strong> {new Date(reportDetail.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Target Details */}
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider font-jakarta flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-brand-500" />
                    <span>Reported Target</span>
                  </h4>

                  {reportDetail.listing ? (
                    <div className="flex flex-col gap-3">
                      {/* Thumbnail & Title */}
                      <div className="flex gap-3">
                        {reportDetail.listing.images?.[0]?.imageUrl ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-charcoal-200 shrink-0 border border-charcoal-200">
                            <Image
                              src={reportDetail.listing.images[0].imageUrl}
                              alt={reportDetail.listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-charcoal-200 text-charcoal-400 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex flex-col justify-center min-w-0">
                          <Link
                            href={`/listings/${reportDetail.listing.id}`}
                            target="_blank"
                            className="text-xs font-bold text-charcoal-900 hover:text-brand-600 transition-colors line-clamp-2 inline-flex items-center gap-1 group"
                          >
                            <span className="group-hover:underline">{reportDetail.listing.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-charcoal-400 group-hover:text-brand-600" />
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-brand-600 font-jakarta">
                              ₹{reportDetail.listing.price}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-charcoal-100 text-charcoal-600">
                              {reportDetail.listing.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">
                          Listing Description
                        </span>
                        <p className="mt-1 text-xs text-charcoal-700 bg-white p-2.5 rounded-xl border border-charcoal-200/70 line-clamp-3 leading-relaxed">
                          {reportDetail.listing.description || <span className="text-charcoal-400 italic">No description provided.</span>}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-charcoal-200/70 text-[11px] text-charcoal-600 flex items-center gap-1.5 truncate mt-auto">
                        <User className="w-3 h-3 text-charcoal-400 shrink-0" />
                        <span><strong>Seller:</strong> {reportDetail.listing.seller.name} ({reportDetail.listing.seller.email})</span>
                      </div>
                    </div>
                  ) : reportDetail.reportedUser ? (
                    <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-charcoal-200/70 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                          {reportDetail.reportedUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-charcoal-900">{reportDetail.reportedUser.name}</span>
                          <span className="text-[11px] text-charcoal-500">{reportDetail.reportedUser.email}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-charcoal-100 text-[11px]">
                        <span className="text-charcoal-500">Account Status: </span>
                        <span className="font-bold text-charcoal-800">{reportDetail.reportedUser.status}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal-400 italic">Target no longer exists or was removed.</span>
                  )}
                </div>
              </div>

              {/* Resolution Section */}
              {reportDetail.status === "RESOLVED" ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold font-jakarta text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Report Resolved</span>
                  </div>
                  <div className="text-emerald-950 font-medium">
                    <strong>Action Taken:</strong> {reportDetail.actionTaken?.replace(/_/g, " ")}
                  </div>
                  {reportDetail.resolutionNotes && (
                    <div className="text-emerald-850 bg-white/70 p-3 rounded-xl border border-emerald-200/80 italic">
                      <strong>Admin Notes:</strong> &ldquo;{reportDetail.resolutionNotes}&rdquo;
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-700 pt-2 border-t border-emerald-200/70">
                    Resolved by <strong>{reportDetail.reviewedBy?.name || "Admin"}</strong> on{" "}
                    {reportDetail.resolvedAt ? new Date(reportDetail.resolvedAt).toLocaleString() : "N/A"}
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider font-jakarta flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-500" />
                      <span>Moderator Action & Resolution</span>
                    </h4>
                    <p className="text-[11px] text-charcoal-500">
                      Choose a resolution action. All actions are logged and send automated emails to relevant parties.
                    </p>
                  </div>

                  {resolveSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Report resolved successfully! Updated queue.</span>
                    </div>
                  )}

                  {/* Actions Radio List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        action: "DISMISSED" as ReportAction,
                        title: "Dismiss Report",
                        desc: "False alarm. No penalty on listing or user.",
                      },
                      {
                        action: "WARNING_ISSUED" as ReportAction,
                        title: "Issue Warning Email",
                        desc: "Sends formal guideline reminder email to target.",
                      },
                      {
                        action: "LISTING_REMOVED" as ReportAction,
                        title: "Remove Listing",
                        desc: "Hides listing & sends takedown email with notes.",
                      },
                      {
                        action: "USER_SUSPENDED" as ReportAction,
                        title: "Suspend User",
                        desc: "Locks account & hides all their active listings.",
                      },
                    ].map((item) => {
                      const isSelected = actionChoice === item.action;
                      return (
                        <label
                          key={item.action}
                          className={cn(
                            "group relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none",
                            isSelected
                              ? "bg-brand-50/70 border-brand-500 ring-1 ring-brand-500/30 shadow-xs"
                              : "bg-white border-charcoal-200/90 hover:bg-charcoal-50/80 hover:border-charcoal-300"
                          )}
                        >
                          <input
                            type="radio"
                            name="resolutionAction"
                            value={item.action}
                            checked={isSelected}
                            onChange={() => setActionChoice(item.action)}
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
                              {item.title}
                            </span>
                            <span className="text-[11px] text-charcoal-500 leading-normal">
                              {item.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Notes Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="adminNotes" className="text-xs font-bold text-charcoal-800 font-jakarta">
                        Resolution Notes{" "}
                        <span className="text-charcoal-400 font-normal">
                          (Included in transactional email sent to target)
                        </span>
                      </label>
                      <span className="text-[11px] text-charcoal-400 font-mono">
                        {notes.length}/1000
                      </span>
                    </div>
                    <textarea
                      id="adminNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="State reason or guidelines violated (e.g. 'Exam answer keys violate campus academic honesty policies')..."
                      rows={3}
                      maxLength={1000}
                      className="w-full text-xs p-3 rounded-2xl border border-charcoal-200 text-charcoal-900 placeholder:text-charcoal-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-y min-h-[75px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fixed & Non-shrinking Footer */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-charcoal-100 bg-charcoal-50/70 flex items-center justify-end gap-3">
              {reportDetail.status === "RESOLVED" ? (
                <button
                  type="button"
                  onClick={closeReportDetail}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-charcoal-900 hover:bg-charcoal-800 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isResolving}
                    onClick={closeReportDetail}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-white border border-charcoal-200/90 hover:bg-charcoal-100 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResolving}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-xs active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying Action...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm & Resolve</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
