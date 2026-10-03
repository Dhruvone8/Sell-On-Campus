import multer from "multer";
import { handleMulterError } from "./multer-error.middleware.js";
import type { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, and WebP image files are allowed"));
        }
    }
});


export function uploadListingImages(req: Request, res: Response, next: NextFunction) {
    upload.array("images", 5)(req, res, (error) => {
        if (error) {
            return handleMulterError(error, req, res, next);
        }

        next();
    });
}