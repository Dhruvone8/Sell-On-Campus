/**
 * Global application constants
 */

export function optimizeCloudinaryUrl(url: string): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + "/upload/".length);
  const remainder = url.slice(uploadIndex + "/upload/".length);

  // Strip any existing transformation segment before version/filename
  const versionOrFileMatch = remainder.match(/(v\d+\/.*|[^\/]+$)/);
  const path = versionOrFileMatch ? versionOrFileMatch[0] : remainder;

  // Deliver modern auto format (WebP/AVIF) and best quality for razor-sharp clarity
  return `${prefix}f_auto,q_auto:best/${path}`;
}

const rawLogoUrl =
  process.env.NEXT_PUBLIC_LOGO_URL || "";

export const APP_LOGO_URL = optimizeCloudinaryUrl(rawLogoUrl);

export function getFaviconUrl(url: string, size?: number): string {
  if (!url || !url.includes("res.cloudinary.com") || !size) {
    return url;
  }
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;
  const prefix = url.slice(0, uploadIndex + "/upload/".length);
  const remainder = url.slice(uploadIndex + "/upload/".length);
  const versionOrFileMatch = remainder.match(/(v\d+\/.*|[^\/]+$)/);
  const path = versionOrFileMatch ? versionOrFileMatch[0] : remainder;
  return `${prefix}w_${size},h_${size},c_fit/${path}`;
}

const rawFaviconUrl =
  process.env.NEXT_PUBLIC_FAVICON_URL ||
  "https://res.cloudinary.com/tiuyn5qd/image/upload/v1790494828/logo-favicon.png";

export const APP_FAVICON_URL = rawFaviconUrl;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_URL.startsWith("https")
    ? API_URL.replace(/^https/, "wss")
    : API_URL.replace(/^http/, "ws"));

