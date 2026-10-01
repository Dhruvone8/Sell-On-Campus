/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Listing, ListingCondition } from "@/lib/types";
import { ConditionSelector } from "@/components/create-listing/condition-selector";
import { CategorySelector } from "@/components/create-listing/category-selector";
import { Loader2, ArrowLeft, Check, AlertCircle, Sparkles, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface EditListingFormProps {
  listing: Listing;
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();

  // Form Fields prefilled from listing
  const [title, setTitle] = React.useState(listing.title || "");
  const [price, setPrice] = React.useState(String(listing.price || ""));
  const [categoryId, setCategoryId] = React.useState(
    listing.categoryId || listing.category?.id || ""
  );
  const [condition, setCondition] = React.useState<ListingCondition>(
    listing.condition || "LIKE_NEW"
  );
  const [description, setDescription] = React.useState(listing.description || "");

  // Optional Specifications
  const [brand, setBrand] = React.useState(listing.brand || "");
  const [model, setModel] = React.useState(listing.model || "");
  const [color, setColor] = React.useState(listing.color || "");

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    } else if (title.trim().length > 50) {
      errors.title = "Title must be at most 50 characters.";
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      errors.price = "Please enter a valid price (0 or greater).";
    }

    if (!categoryId) {
      errors.categoryId = "Please select a category.";
    }

    if (!description.trim() || description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long.";
    } else if (description.trim().length > 200) {
      errors.description = "Description must be at most 200 characters.";
    }

    if (brand && brand.trim().length > 20) {
      errors.brand = "Brand must be at most 20 characters.";
    }
    if (model && model.trim().length > 30) {
      errors.model = "Model must be at most 30 characters.";
    }
    if (color && color.trim().length > 15) {
      errors.color = "Color must be at most 15 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      setTimeout(() => {
        const errorOrder = ["title", "categoryId", "price", "description", "brand", "model", "color"];
        for (const key of errorOrder) {
          const el = document.getElementById(`edit-field-${key}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if ("focus" in el && typeof el.focus === "function") {
              el.focus();
            }
            break;
          }
        }
      }, 50);
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const payload: {
        title: string;
        price: number;
        categoryId: string;
        condition: ListingCondition;
        description: string;
        brand?: string | null;
        model?: string | null;
        color?: string | null;
      } = {
        title: title.trim(),
        price: Number(price),
        categoryId,
        condition,
        description: description.trim(),
        brand: brand.trim() || null,
        model: model.trim() || null,
        color: color.trim() || null,
      };

      const res = await fetch(`${apiUrl}/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update listing");
      }

      setIsSuccess(true);
      setSuccessMessage("Listing updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/my-listings");
        router.refresh();
      }, 900);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMessage(errMsg);
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      {/* Top Banner feedback */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Failed to save changes</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      {/* Existing Photos Showcase */}
      {listing.images && listing.images.length > 0 && (
        <div className="p-5 bg-white rounded-2xl border border-charcoal-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal-900 font-jakarta flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-500" />
              Listing Photos ({listing.images.length})
            </h3>
            <span className="text-[11px] text-charcoal-500">
              Attached to listing
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {listing.images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-charcoal-200/70 bg-charcoal-50 group"
              >
                <img
                  src={img.imageUrl}
                  alt={`Listing photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white shadow-xs">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Details Section */}
      <div className="p-6 bg-white rounded-2xl border border-charcoal-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-charcoal-900 font-jakarta flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            Core Information
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Update the title, category, price, and wear condition.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-charcoal-900 font-jakarta">
              Title <span className="text-brand-500">*</span>
            </label>
            <span className="text-xs text-charcoal-400 font-mono">
              {title.length}/50
            </span>
          </div>
          <input
            id="edit-field-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            placeholder="e.g. Engineering Mathematics Vol 1 (HK Dass)"
            className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
          />
          {fieldErrors.title && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        {/* Category & Price in two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Selector */}
          <div id="edit-field-categoryId">
            <CategorySelector
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
              Price (₹) <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-bold text-sm">
                ₹
              </span>
              <input
                id="edit-field-price"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-medium text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400"
              />
            </div>
            {fieldErrors.price && (
              <p className="text-xs text-red-600 font-medium">{fieldErrors.price}</p>
            )}
          </div>
        </div>

        {/* Condition Selector */}
        <ConditionSelector
          value={condition}
          onChange={(cond) => setCondition(cond)}
        />

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-charcoal-900 font-jakarta">
              Description <span className="text-brand-500">*</span>
            </label>
            <span className="text-xs text-charcoal-400 font-mono">
              {description.length}/200
            </span>
          </div>
          <textarea
            id="edit-field-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="Describe condition, year, reason for selling, or meetup preferences..."
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-charcoal-900 outline-none transition-all placeholder:text-charcoal-400 resize-none leading-relaxed"
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.description}</p>
          )}
        </div>
      </div>

      {/* Specifications Section */}
      <div className="p-6 bg-white rounded-2xl border border-charcoal-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-charcoal-900 font-jakarta">
            Optional Specifications
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Add specifications to help buyers find your item faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700">Brand</label>
            <input
              id="edit-field-brand"
              type="text"
              maxLength={20}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Hero, Casio, Apple"
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200/80 focus:border-brand-500 text-sm text-charcoal-900 outline-none"
            />
            {fieldErrors.brand && (
              <p className="text-xs text-red-600">{fieldErrors.brand}</p>
            )}
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700">Model</label>
            <input
              id="edit-field-model"
              type="text"
              maxLength={30}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. fx-991EX, Sprint Pro"
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200/80 focus:border-brand-500 text-sm text-charcoal-900 outline-none"
            />
            {fieldErrors.model && (
              <p className="text-xs text-red-600">{fieldErrors.model}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-charcoal-700">Color</label>
            <input
              id="edit-field-color"
              type="text"
              maxLength={15}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Matte Black, Blue"
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200/80 focus:border-brand-500 text-sm text-charcoal-900 outline-none"
            />
            {fieldErrors.color && (
              <p className="text-xs text-red-600">{fieldErrors.color}</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation helper alert if there are errors */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>Please resolve the highlighted fields above before saving changes.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/my-listings"
          className={cn(
            "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200 transition-colors",
            (isSubmitting || isSuccess) && "pointer-events-none opacity-50"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]",
            isSuccess
              ? "bg-emerald-600 text-white shadow-emerald-600/25 cursor-default"
              : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25",
            (isSubmitting || isSuccess) && "disabled:opacity-85 disabled:cursor-not-allowed"
          )}
        >
          {isSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Changes Saved! Redirecting...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
