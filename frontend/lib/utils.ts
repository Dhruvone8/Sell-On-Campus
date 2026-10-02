/**
 * Combines class names, filtering out falsy values.
 */
export function cn(...inputs: unknown[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .join(" ");
}

/**
 * Formats a numeric price with a currency symbol.
 * Default is ₹ (INR) as used in the tested conversations baseline.
 */
export function formatPrice(price: number | string | null | undefined, currency = "₹"): string {
  if (price === null || price === undefined || price === "") {
    return `${currency}0`;
  }
  const num = typeof price === "number" ? price : parseFloat(price);
  if (isNaN(num)) {
    return `${currency}${price}`;
  }
  return `${currency}${num.toLocaleString("en-IN")}`;
}

/**
 * Formats an ISO date into a human-friendly relative recency string (e.g. "5m ago", "2h ago", "1d ago", "2w ago", "1mo ago").
 */
export function formatRelativeTime(
  dateString: string | Date | null | undefined,
  options?: { verbose?: boolean }
): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (!date || isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return options?.verbose
      ? `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
      : `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInSeconds / 3600);
  if (diffInHours < 24) {
    return options?.verbose
      ? `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
      : `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 7) {
    return options?.verbose
      ? `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
      : `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return options?.verbose
      ? `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`
      : `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const m = Math.max(1, diffInMonths);
    return options?.verbose
      ? `${m} month${m === 1 ? "" : "s"} ago`
      : `${m}mo ago`;
  }

  const diffInYears = Math.max(1, Math.floor(diffInDays / 365));
  return options?.verbose
    ? `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`
    : `${diffInYears}y ago`;
}

/**
 * Formats a date into a clean display format, e.g. "Sep 24, 2026".
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Extracts initials from a user's name (e.g., "Dhruv Singhania" -> "DS", "Dhruv" -> "D").
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";

  // If an email address was passed instead of a display name
  const cleanName = name.includes("@")
    ? name.split("@")[0].replace(/[._-]/g, " ")
    : name;

  const parts = cleanName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
