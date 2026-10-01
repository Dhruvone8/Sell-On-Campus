/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  UploadCloud,
  Trash2,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditableImage {
  id: string;
  type: "existing" | "new";
  url: string;
  file?: File;
}

export interface EditImageManagerProps {
  images: EditableImage[];
  onImagesChange: (images: EditableImage[]) => void;
  onImageDeleted: (id: string) => void;
  maxImages?: number;
  error?: string | null;
}

export function EditImageManager({
  images,
  onImagesChange,
  onImageDeleted,
  maxImages = 5,
  error,
}: EditImageManagerProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const addInputRef = React.useRef<HTMLInputElement | null>(null);
  const replaceInputRef = React.useRef<HTMLInputElement | null>(null);
  const [replacingIndex, setReplacingIndex] = React.useState<number | null>(null);

  // Track blob URLs to revoke on unmount
  const createdBlobUrlsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const urls = createdBlobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  const handleAddFiles = (newFileList: FileList | File[]) => {
    setLocalError(null);
    const added: EditableImage[] = [];

    for (let i = 0; i < newFileList.length; i++) {
      const file = newFileList[i];
      if (!file.type.startsWith("image/")) {
        setLocalError("Only image files (JPEG, PNG, WebP) are allowed.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setLocalError(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }

      const url = URL.createObjectURL(file);
      createdBlobUrlsRef.current.add(url);

      added.push({
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
        type: "new",
        url,
        file,
      });
    }

    const availableSlots = maxImages - images.length;
    if (added.length > availableSlots) {
      setLocalError(`You can upload at most ${maxImages} photos. Additional photos were ignored.`);
    }

    const next = [...images, ...added.slice(0, availableSlots)];
    onImagesChange(next);
  };

  const handleReplaceSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || replacingIndex === null) {
      setReplacingIndex(null);
      return;
    }

    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      setLocalError("Only image files (JPEG, PNG, WebP) are allowed.");
      setReplacingIndex(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError(`"${file.name}" exceeds the 5MB size limit.`);
      setReplacingIndex(null);
      return;
    }

    const target = images[replacingIndex];
    if (target) {
      if (target.type === "existing") {
        onImageDeleted(target.id);
      } else if (target.url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(target.url);
          createdBlobUrlsRef.current.delete(target.url);
        } catch {
          // ignore
        }
      }

      const newUrl = URL.createObjectURL(file);
      createdBlobUrlsRef.current.add(newUrl);

      const updated = [...images];
      updated[replacingIndex] = {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: "new",
        url: newUrl,
        file,
      };
      onImagesChange(updated);
    }

    setReplacingIndex(null);
  };

  const handleDelete = (index: number) => {
    setLocalError(null);
    const target = images[index];
    if (!target) return;

    if (target.type === "existing") {
      onImageDeleted(target.id);
    } else if (target.url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(target.url);
        createdBlobUrlsRef.current.delete(target.url);
      } catch {
        // ignore
      }
    }

    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onImagesChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onImagesChange(updated);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  return (
    <div id="edit-field-images" className="p-5 bg-white rounded-2xl border border-charcoal-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-charcoal-900 font-jakarta flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-brand-500" />
            Listing Photos ({images.length}/{maxImages})
            <span className="text-brand-500">*</span>
          </h3>
          <p className="text-xs text-charcoal-500 mt-0.5">
            The first photo is your cover. Hover or tap any photo to replace, delete, or set as cover.
          </p>
        </div>

        {images.length > 0 && images.length < maxImages && (
          <button
            type="button"
            onClick={() => addInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {/* Hidden file input for adding new photos */}
      <input
        ref={addInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleAddFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {/* Hidden file input for replacing an individual photo */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleReplaceSelect(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Error Callouts */}
      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error || localError}</span>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border bg-charcoal-100 group shadow-2xs transition-all",
              idx === 0
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-charcoal-200/80 hover:border-charcoal-300"
            )}
          >
            <img
              src={img.url}
              alt={`Listing photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Cover Badge */}
            {idx === 0 && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-bold tracking-tight shadow-sm flex items-center gap-1 z-10">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>Cover</span>
              </div>
            )}

            {/* Status pill for newly added photos */}
            {img.type === "new" && idx !== 0 && (
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-charcoal-900/75 backdrop-blur-xs text-white text-[9px] font-semibold z-10">
                New
              </div>
            )}

            {/* Top-Right Action Buttons: Replace & Delete */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {/* Replace Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReplacingIndex(idx);
                  replaceInputRef.current?.click();
                }}
                className="p-1.5 rounded-lg bg-charcoal-900/85 hover:bg-brand-600 text-white transition-colors cursor-pointer shadow-sm"
                title="Replace with new photo"
                aria-label={`Replace photo ${idx + 1}`}
              >
                <RefreshCw className="w-3 h-3 stroke-[2.5]" />
              </button>

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(idx);
                }}
                className="p-1.5 rounded-lg bg-charcoal-900/85 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-sm"
                title="Delete photo"
                aria-label={`Delete photo ${idx + 1}`}
              >
                <Trash2 className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Bottom Toolbar: Reordering & Make Cover */}
            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/40 to-transparent flex items-center justify-between gap-1 opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {/* Left / Right move controls */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(idx, idx - 1);
                  }}
                  className="p-1 rounded text-white/90 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move left"
                  aria-label="Move photo left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(idx, idx + 1);
                  }}
                  className="p-1 rounded text-white/90 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Move right"
                  aria-label="Move photo right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Set Cover Button (for non-cover photos) */}
              {idx > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMakeCover(idx);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-white/20 hover:bg-brand-500 hover:text-white backdrop-blur-xs transition-colors cursor-pointer"
                  title="Make this the cover photo"
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Cover</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add Photo Card in Grid (if slots available) */}
        {images.length < maxImages && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => addInputRef.current?.click()}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer p-2",
              isDragging
                ? "border-brand-500 bg-brand-50/60 scale-[0.98]"
                : "border-charcoal-200/90 hover:border-brand-500/70 bg-charcoal-50/50 hover:bg-brand-50/20"
            )}
            title="Click or drag to add photo"
          >
            <div className="w-8 h-8 rounded-lg bg-white text-brand-500 border border-charcoal-200/60 flex items-center justify-center mb-1.5 shadow-2xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-charcoal-800">Add Photo</span>
            <span className="text-[10px] text-charcoal-400 mt-0.5">
              {maxImages - images.length} left
            </span>
          </div>
        )}
      </div>

      {/* Drag & Drop Banner (if no photos yet) */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => addInputRef.current?.click()}
          className={cn(
            "p-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer",
            isDragging
              ? "border-brand-500 bg-brand-50/60"
              : "border-charcoal-200 hover:border-brand-500/60 bg-charcoal-50/50 hover:bg-brand-50/20"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-white text-brand-500 border border-charcoal-200/60 flex items-center justify-center mb-2 shadow-2xs">
            <UploadCloud className="w-6 h-6 stroke-[2]" />
          </div>
          <p className="text-sm font-bold text-charcoal-900">
            Click to upload or drag &amp; drop photos
          </p>
          <p className="text-xs text-charcoal-400 mt-1">
            PNG, JPG, or WEBP up to 5MB each (at least 1 required)
          </p>
        </div>
      )}
    </div>
  );
}
