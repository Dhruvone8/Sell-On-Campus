import type { Request, Response, NextFunction } from "express";
import { isAllowedOrigin } from "../utils/origin.util.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function verifyMutationOrigin(req: Request, res: Response, next: NextFunction) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const origin = req.headers.origin;
    if (origin) {
        if (!isAllowedOrigin(origin)) {
            return res.status(403).json({
                message: "Forbidden: Request origin not allowed",
            });
        }
        return next();
    }

    const referer = req.headers.referer;
    if (referer) {
        try {
            const refererOrigin = new URL(referer).origin;
            if (!isAllowedOrigin(refererOrigin)) {
                return res.status(403).json({
                    message: "Forbidden: Request referer not allowed",
                });
            }
            return next();
        } catch {
            return res.status(403).json({
                message: "Forbidden: Invalid referer header",
            });
        }
    }

    // If browser indicates cross-site without an approved origin, block it
    const secFetchSite = req.headers["sec-fetch-site"];
    if (secFetchSite === "cross-site") {
        return res.status(403).json({
            message: "Forbidden: Untrusted cross-site request",
        });
    }

    next();
}
