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
 * Formats an ISO date into a human-friendly relative recency string (e.g. "5m ago", "2h ago").
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInSeconds / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
 * Extracts initials from a user's name (e.g., "Alex Rivera" -> "AR").
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
