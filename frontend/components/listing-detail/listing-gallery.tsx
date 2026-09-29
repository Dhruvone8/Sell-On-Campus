/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { ListingImage } from "@/lib/types";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[activeIndex]?.imageUrl;
  const isCurrentFailed = failedImages[activeIndex];

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Main Image Display */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal-100 border border-charcoal-200/70 shadow-xs">
        {currentImage && !isCurrentFailed ? (
          <img
            src={currentImage}
            alt={`${title} - view ${activeIndex + 1}`}
            onError={() => handleImageError(activeIndex)}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-charcoal-100 to-charcoal-200/70 text-charcoal-400 p-6 text-center">
            <Tag className="w-12 h-12 mb-2 stroke-[1.5] text-charcoal-400" />
            <span className="text-sm font-semibold text-charcoal-600">
              {title}
            </span>
            <span className="text-xs text-charcoal-400 mt-1">
              No photos uploaded by seller
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {validImages.map((img, idx) => {
            const isActive = idx === activeIndex;
            const isFailed = failedImages[idx];

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative aspect-[4/3] rounded-xl overflow-hidden bg-charcoal-100 border transition-all cursor-pointer",
                  isActive
                    ? "ring-2 ring-brand-500 border-transparent opacity-100 shadow-xs scale-[1.02]"
                    : "border-charcoal-200/70 opacity-70 hover:opacity-100 hover:border-charcoal-300"
                )}
              >
                {!isFailed ? (
                  <img
                    src={img.imageUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={() => handleImageError(idx)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal-400 bg-charcoal-100">
                    <Tag className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
