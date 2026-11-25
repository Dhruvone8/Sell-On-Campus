/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move, Loader2 } from "lucide-react";

const STAGE_SIZE = 300;
const CROP_DIAMETER = 256;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export interface AvatarCropModalProps {
  file: File;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function AvatarCropModal({ file, onCancel, onConfirm }: AvatarCropModalProps) {
  const [loadedImage, setLoadedImage] = React.useState<{ file: File; url: string } | null>(null);
  const [naturalSize, setNaturalSize] = React.useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const dragStartRef = React.useRef<{
    pointerX: number;
    pointerY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setLoadedImage({ file, url: reader.result });
      }
    };

    reader.onerror = () => {
      if (!cancelled) {
        setLoadError("Could not load the selected image.");
      }
    };

    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file]);

  const imageSrc = loadedImage?.file === file ? loadedImage.url : null;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExporting) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExporting, onCancel]);

  const baseScale = React.useMemo(() => {
    if (!naturalSize) return 1;
    return Math.max(CROP_DIAMETER / naturalSize.width, CROP_DIAMETER / naturalSize.height);
  }, [naturalSize]);

  const effectiveScale = baseScale * zoom;

  const clampOffset = React.useCallback(
    (nextX: number, nextY: number, nextZoom: number) => {
      if (!naturalSize) return { x: 0, y: 0 };
      const scale = baseScale * nextZoom;
      const renderedWidth = naturalSize.width * scale;
      const renderedHeight = naturalSize.height * scale;
      const maxX = Math.max(0, (renderedWidth - CROP_DIAMETER) / 2);
      const maxY = Math.max(0, (renderedHeight - CROP_DIAMETER) / 2);
      return {
        x: clamp(nextX, -maxX, maxX),
        y: clamp(nextY, -maxY, maxY),
      };
    },
    [baseScale, naturalSize]
  );

  const handleZoomChange = (nextZoom: number) => {
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, clampedZoom));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!naturalSize || isExporting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    setOffset(
      clampOffset(
        dragStartRef.current.startOffsetX + dx,
        dragStartRef.current.startOffsetY + dy,
        zoom
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!naturalSize || isExporting) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    handleZoomChange(zoom + delta);
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirmCrop = async () => {
    const img = imgRef.current;
    if (!img || !naturalSize || isExporting) return;

    try {
      setIsExporting(true);
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not initialize image cropper");
      }

      const sx = naturalSize.width / 2 - (CROP_DIAMETER / 2 + offset.x) / effectiveScale;
      const sy = naturalSize.height / 2 - (CROP_DIAMETER / 2 + offset.y) / effectiveScale;
      const sSize = CROP_DIAMETER / effectiveScale;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const exportType = file.type === "image/png" ? "image/png" : "image/webp";
      const ext = exportType === "image/png" ? "png" : "webp";

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, exportType, 0.92);
      });

      const finalBlob =
        blob ||
        (await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.92);
        }));

      if (!finalBlob) {
        throw new Error("Failed to export cropped image");
      }

      const finalExt = finalBlob.type === "image/jpeg" ? "jpg" : ext;
      const croppedFile = new File([finalBlob], `profile-avatar.${finalExt}`, {
        type: finalBlob.type,
        lastModified: Date.now(),
      });

      onConfirm(croppedFile);
    } catch (err) {
      console.error("Avatar crop failed:", err);
      setLoadError("Could not process this image. Please try another photo.");
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExporting) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-charcoal-200/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between">
          <div>
            <h3
              id="avatar-crop-title"
              className="text-base font-bold text-charcoal-900 font-jakarta"
            >
              Adjust Profile Photo
            </h3>
            <p className="text-xs text-charcoal-500">
              Drag to reposition and zoom to fit the circle.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isExporting}
            aria-label="Close photo editor"
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Circular Crop Stage */}
        <div className="p-5 flex flex-col items-center gap-4 bg-charcoal-50/60">
          {loadError ? (
            <div className="w-[300px] h-[300px] rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center p-6 text-center text-xs font-medium text-red-700">
              {loadError}
            </div>
          ) : (
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              style={{ width: STAGE_SIZE, height: STAGE_SIZE, touchAction: "none" }}
              className="relative rounded-2xl overflow-hidden bg-charcoal-900 select-none cursor-grab active:cursor-grabbing shadow-inner"
            >
              {imageSrc && (
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    if (el.naturalWidth > 0 && el.naturalHeight > 0) {
                      setNaturalSize({
                        width: el.naturalWidth,
                        height: el.naturalHeight,
                      });
                    } else {
                      setLoadError("Invalid image dimensions.");
                    }
                  }}
                  onError={() => setLoadError("Could not load the selected image.")}
                  style={
                    naturalSize
                      ? {
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: naturalSize.width * effectiveScale,
                          height: naturalSize.height * effectiveScale,
                          maxWidth: "none",
                          maxHeight: "none",
                          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                        }
                      : { opacity: 0 }
                  }
                />
              )}

              {!naturalSize && !loadError && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              {/* Circular Cutout Overlay */}
              <div
                style={{
                  width: CROP_DIAMETER,
                  height: CROP_DIAMETER,
                  boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.62)",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/95"
              >
                {/* Subtle alignment grid shown while dragging */}
                <div
                  className={`absolute inset-0 rounded-full transition-opacity duration-150 ${
                    isDragging ? "opacity-55" : "opacity-0"
                  }`}
                >
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
                </div>
              </div>

              {/* Subtle drag hint pill */}
              <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-charcoal-950/60 text-white/90 text-[10px] font-medium backdrop-blur-xs">
                <Move className="w-3 h-3" />
                <span>Drag to adjust</span>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="w-full max-w-[300px] flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.15)}
              disabled={!naturalSize || zoom <= MIN_ZOOM || isExporting}
              aria-label="Zoom out"
              className="p-1.5 rounded-lg text-charcoal-600 hover:bg-charcoal-200/70 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              aria-label="Zoom photo"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!naturalSize || isExporting}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="flex-1 accent-brand-500 cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.15)}
              disabled={!naturalSize || zoom >= MAX_ZOOM || isExporting}
              aria-label="Zoom in"
              className="p-1.5 rounded-lg text-charcoal-600 hover:bg-charcoal-200/70 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={!naturalSize || (zoom === 1 && offset.x === 0 && offset.y === 0) || isExporting}
              title="Reset crop"
              aria-label="Reset zoom and position"
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-200/70 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-charcoal-100 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={!naturalSize || !!loadError || isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Apply Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
