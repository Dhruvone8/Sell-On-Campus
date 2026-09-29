"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Listing, GetListingsResponse, ListingPagination } from "@/lib/types";
import {
  MarketplaceHeader,
  FilterSidebar,
  MobileFilterDrawer,
  MarketplaceControls,
  MarketplaceGrid,
  MarketplacePagination,
  FilterValues,
} from "@/components/marketplace";

export function ListingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const condition = (searchParams.get("condition") as FilterValues["condition"]) || undefined;
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const sort = (searchParams.get("sort") as FilterValues["sort"]) || "newest";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filters: FilterValues = React.useMemo(
    () => ({
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      sort,
    }),
    [search, category, condition, minPrice, maxPrice, sort]
  );

  // Layout mode
  const [layout, setLayout] = React.useState<"grid" | "list">("grid");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Data fetching state
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [pagination, setPagination] = React.useState<ListingPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Compute active non-default filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.condition) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  }, [filters]);

  // Update URL helper
  const updateUrlWithFilters = React.useCallback(
    (newFilters: Partial<FilterValues>, newPage = 1) => {
      const merged = { ...filters, ...newFilters };
      const params = new URLSearchParams();

      if (merged.search) params.set("search", merged.search);
      if (merged.category) params.set("category", merged.category);
      if (merged.condition) params.set("condition", merged.condition);
      if (merged.minPrice) params.set("minPrice", merged.minPrice);
      if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
      if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
      if (newPage > 1) params.set("page", String(newPage));

      const queryString = params.toString();
      router.push(`/listings${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [filters, router]
  );

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    updateUrlWithFilters(newFilters, 1);
  };

  const handleResetFilters = () => {
    router.push("/listings", { scroll: false });
  };

  const handlePageChange = (page: number) => {
    updateUrlWithFilters({}, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch listings from backend
  React.useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      await Promise.resolve();
      if (!isMounted) return;
      setIsLoading(true);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const queryParams = new URLSearchParams();

        queryParams.set("page", String(currentPage));
        queryParams.set("limit", "12");
        queryParams.set("sort", filters.sort || "newest");

        // If search or category query exists
        if (filters.search) {
          queryParams.set("search", filters.search);
        }
        if (filters.category) {
          queryParams.set("category", filters.category);
        }

        if (filters.condition) {
          queryParams.set("condition", filters.condition);
        }

        if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
          queryParams.set("minPrice", filters.minPrice);
        }

        if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
          queryParams.set("maxPrice", filters.maxPrice);
        }

        const res = await fetch(`${apiUrl}/api/listings?${queryParams.toString()}`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load listings (${res.status})`);
        }

        const data: GetListingsResponse = await res.json();
        if (isMounted) {
          setListings(data.listings || []);
          setPagination(
            data.pagination || {
              page: currentPage,
              limit: 12,
              total: data.listings ? data.listings.length : 0,
              totalPages: 1,
            }
          );
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn("Could not fetch marketplace listings:", err);
          setListings([]);
          setPagination({
            page: currentPage,
            limit: 12,
            total: 0,
            totalPages: 1,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    filters.sort,
    filters.search,
    filters.category,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Campus Status Banner */}
      <MarketplaceHeader
        onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Workspace (Sticky Filter + Listings Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Filter Panel (Desktop) */}
        <aside className="lg:col-span-3 w-full lg:sticky lg:top-20 z-10 hidden lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Right Listings Section */}
        <section className="lg:col-span-9 flex flex-col gap-6 w-full">
          {/* Controls & Meta Bar */}
          <MarketplaceControls
            totalItems={pagination.total}
            filters={filters}
            onFilterChange={handleFilterChange}
            layout={layout}
            onLayoutChange={setLayout}
          />

          {/* Listings Grid or List or Skeletons or Empty */}
          <MarketplaceGrid
            listings={listings}
            isLoading={isLoading}
            layout={layout}
            onResetFilters={handleResetFilters}
            hasActiveFilters={activeFilterCount > 0}
          />

          {/* Pagination Controls */}
          {!isLoading && pagination.totalPages > 1 && (
            <MarketplacePagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              currentCount={listings.length}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </div>

      {/* Mobile Filters Slide-over */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
