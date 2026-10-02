"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ListingCondition } from "@/lib/types";
import { ImageUploader } from "./image-uploader";
import { ConditionSelector } from "./condition-selector";
import { CategorySelector } from "./category-selector";
import { Loader2, PlusCircle, ShieldCheck, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";

export function CreateListingForm() {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("095f6600-e992-4e23-8687-6c9b38163e04"); // Default to Books
  const [condition, setCondition] = React.useState<ListingCondition>("LIKE_NEW");
  const [description, setDescription] = React.useState("");

  // Optional Specifications
  const [showSpecs, setShowSpecs] = React.useState(false);
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [color, setColor] = React.useState("");

  // Photos
  const [files, setFiles] = React.useState<File[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
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

    if (!validate()) {
      setTimeout(() => {
        const errorOrder = ["title", "categoryId", "price", "description", "brand", "model", "color"];
        for (const key of errorOrder) {
          const el = document.getElementById(`create-field-${key}`);
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
      const apiUrl = API_URL;

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("price", String(Number(price)));
      formData.append("categoryId", categoryId);
      formData.append("condition", condition);
      formData.append("description", description.trim());

      if (brand.trim()) formData.append("brand", brand.trim());
      if (model.trim()) formData.append("model", model.trim());
      if (color.trim()) formData.append("color", color.trim());

      // Append image files
      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(`${apiUrl}/api/listings`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/listings/create`);
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create listing (${res.status})`
        );
      }

      const data = await res.json();
      const listingId = data.listing?.id;

      setIsSuccess(true);

      if (listingId) {
        router.push(`/listings/${listingId}`);
      } else {
        router.push("/listings");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating listing";
      setErrorMessage(msg);
      setIsSubmitting(false);
      setIsSuccess(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Photo Upload */}
      <div className="p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs">
        <ImageUploader files={files} onFilesChange={setFiles} maxFiles={5} />
      </div>

      {/* 2. Item Essentials */}
      <div className="p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-charcoal-900 font-jakarta border-b border-charcoal-100 pb-3">
          Item Essentials
        </h2>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
              Listing Title <span className="text-brand-500">*</span>
            </label>
            <span className="text-xs text-charcoal-400">
              {title.length}/50
            </span>
          </div>
          <input
            id="create-field-title"
            type="text"
            required
            maxLength={50}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., TI-84 Plus CE Color Graphing Calculator"
            className="w-full px-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          {fieldErrors.title && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.title}</p>
          )}
        </div>

        {/* Category & Price Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="create-field-categoryId">
            <CategorySelector
              value={categoryId}
              onChange={setCategoryId}
              error={fieldErrors.categoryId}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
              Price (₹) <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-charcoal-400">
                ₹
              </span>
              <input
                id="create-field-price"
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-semibold"
              />
            </div>
            {fieldErrors.price && (
              <p className="text-xs text-red-600 font-medium">{fieldErrors.price}</p>
            )}
          </div>
        </div>

        {/* Condition Selector */}
        <ConditionSelector value={condition} onChange={setCondition} />

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
              Item Description <span className="text-brand-500">*</span>
            </label>
            <span className="text-xs text-charcoal-400">
              {description.length}/200
            </span>
          </div>
          <textarea
            id="create-field-description"
            required
            rows={4}
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe included cables/accessories, course requirements (e.g. required for Math 51), and preferred campus handoff locations..."
            className="w-full px-4 py-3 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none leading-relaxed"
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.description}
            </p>
          )}
        </div>
      </div>

      {/* 3. Optional Specifications Dropdown */}
      <div className="p-6 rounded-2xl bg-white border border-charcoal-200/70 shadow-xs">
        <button
          type="button"
          onClick={() => setShowSpecs(!showSpecs)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div>
            <span className="text-sm font-bold text-charcoal-900 group-hover:text-brand-600 transition-colors block font-jakarta">
              Additional Specifications
            </span>
            <span className="text-xs text-charcoal-500">
              Add brand, model, or color details (optional)
            </span>
          </div>
          <div className="p-1 rounded-lg bg-charcoal-100 text-charcoal-500 group-hover:text-charcoal-900 transition-colors">
            {showSpecs ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showSpecs && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-charcoal-100">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 block">
                Brand
              </label>
              <input
                id="create-field-brand"
                type="text"
                maxLength={20}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 block">
                Model
              </label>
              <input
                id="create-field-model"
                type="text"
                maxLength={30}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. M2 2023"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 block">
                Color
              </label>
              <input
                id="create-field-color"
                type="text"
                maxLength={15}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Space Gray"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-xs font-medium text-charcoal-900 placeholder:text-charcoal-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Campus Safety & Handoff Note */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/70 shadow-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block mb-0.5">Campus Marketplace Pledge</span>
          Meet buyers in high-traffic campus zones (library plaza, student union, dining hall). Free listing with 0% platform fee.
        </div>
      </div>

      {/* Validation helper alert if there are errors */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>Please complete or correct the highlighted fields above before publishing.</span>
        </div>
      )}

      {/* 5. Submit CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isSubmitting || isSuccess}
          onClick={() => router.back()}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-charcoal-200/80 hover:bg-charcoal-50 text-charcoal-700 font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]",
            isSuccess
              ? "bg-emerald-600 text-white shadow-emerald-600/25 cursor-default"
              : "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25",
            (isSubmitting || isSuccess) && "disabled:opacity-85 disabled:cursor-not-allowed"
          )}
        >
          {isSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Listing Published! Redirecting...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{files.length > 0 ? "Uploading photos & publishing..." : "Publishing Listing..."}</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 stroke-[2.2]" />
              <span>Publish Campus Listing</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
