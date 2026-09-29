/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUploader({
  files,
  onFilesChange,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Maintain preview URLs
  const previewUrls = React.useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  // Cleanup object URLs on unmount or file update
  React.useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleAddFiles = (newFileList: FileList | File[]) => {
    setErrorMessage(null);
    const added: File[] = [];

    for (let i = 0; i < newFileList.length; i++) {
      const file = newFileList[i];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Only image files (JPEG, PNG, WebP) are allowed.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      added.push(file);
    }

    const combined = [...files, ...added].slice(0, maxFiles);
    if (files.length + added.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} photos.`);
    }

    onFilesChange(combined);
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-charcoal-900 block font-jakarta">
            Photos ({files.length}/{maxFiles})
          </label>
          <span className="text-xs text-charcoal-500">
            Upload up to 5 clear photos. The first image will be your listing cover.
          </span>
        </div>
        {files.length > 0 && files.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
          >
            + Add more
          </button>
        )}
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
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

      {/* Drop Zone (if no files or space remaining) */}
      {files.length < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer",
            isDragging
              ? "border-brand-500 bg-brand-50/50 scale-[0.99]"
              : "border-charcoal-200/80 hover:border-brand-500/60 bg-charcoal-50/50 hover:bg-brand-50/20"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-white text-brand-500 shadow-2xs border border-charcoal-200/60 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 stroke-[2]" />
          </div>
          <p className="text-sm font-bold text-charcoal-900">
            Click to upload or drag &amp; drop photos
          </p>
          <p className="text-xs text-charcoal-400 mt-1">
            PNG, JPG, or WEBP up to 5MB each
          </p>
        </div>
      )}

      {/* Error callout */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Thumbnails preview strip */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1">
          {previewUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden bg-charcoal-100 border border-charcoal-200 group shadow-2xs"
            >
              <img
                src={url}
                alt={`Preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge on first image */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-charcoal-900/85 backdrop-blur-md text-white text-[10px] font-bold tracking-tight shadow-sm">
                  Cover
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-charcoal-900/80 text-white hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
