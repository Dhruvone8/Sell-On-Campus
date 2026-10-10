export type ListingCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

export type ListingStatus = "ACTIVE" | "RESERVED" | "SOLD";

export interface ListingImage {
  id: string;
  imageUrl: string;
  listingId?: string;
}

export interface Category {
  id: string;
  name: string;
  _count?: {
    listings: number;
  };
}

export interface ListingSeller {
  id: string;
  name?: string | null;
  fullName?: string | null;
  email?: string;
  department?: string | null;
  year?: number | null;
  profileImageUrl?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | string;
  condition: ListingCondition;
  status: ListingStatus;
  brand?: string | null;
  color?: string | null;
  model?: string | null;
  sellerId: string;
  seller?: ListingSeller;
  categoryId: string;
  category?: Category;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetListingsResponse {
  listings: Listing[];
  pagination: ListingPagination;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  department?: string | null;
  year?: number | null;
  profileImageUrl?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReportReason =
  | "FRAUD"
  | "PROHIBITED_ITEM"
  | "INAPPROPRIATE_CONTENT"
  | "MISLEADING_LISTING"
  | "HARASSMENT"
  | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export type ReportAction =
  | "DISMISSED"
  | "WARNING_ISSUED"
  | "LISTING_REMOVED"
  | "USER_SUSPENDED"
  | "USER_BANNED";

export interface ReportSummary {
  id: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  actionTaken?: ReportAction | null;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  listing?: {
    id: string;
    title: string;
    status: string;
  } | null;
  reportedUser?: {
    id: string;
    name: string;
    email: string;
    status: string;
  } | null;
}

export interface ReportDetail extends ReportSummary {
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  listing?: {
    id: string;
    title: string;
    description: string;
    price: number | string;
    condition: string;
    status: string;
    images: { imageUrl: string }[];
    seller: { id: string; name: string; email: string };
  } | null;
}

