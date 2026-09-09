import type { NextFunction, Request, Response } from "express";
import multer from "multer";

export function handleMulterError(error: unknown, _req: Request, res: Response, next: NextFunction) {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Each image must be 5MB or smaller" });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: "Maximum 5 images are allowed" });
        }

        return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error && error.message === "Only image files are allowed") {
        return res.status(400).json({ message: error.message });
    }

    next(error);
}
