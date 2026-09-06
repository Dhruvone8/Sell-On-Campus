import type { Request, Response } from 'express';
import {
    createListing as createListingService, getListingById as getListingByIdService, updateListing as updateListingService,
    updateListingStatus as updateListingStatusService, getMyListings as getMyListingsService, getListings as getListingsService
} from '../services/listing.service.js';
import { AppError } from '../lib/error.js';

export async function createListing(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const { title, description, price, categoryId, condition, brand, color, model } = req.body;

        const listing = await createListingService({
            sellerId: userId,
            title,
            description,
            price,
            categoryId,
            condition,
            brand,
            color,
            model
        });

        return res.status(201).json({ message: "Listing created successfully", listing });

    } catch (error) {
        console.error("Create listing error:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function getListingById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        const listing = await getListingByIdService(id);

        return res.status(200).json({ listing });

    } catch (error) {
        console.error("Get Listing by ID error:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateListing(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        const listing = await updateListingService(id, userId, req.body);

        return res.status(200).json({ message: "Listing updated successfully", listing });

    } catch (error) {
        console.error("Update Listing error:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateListingStatus(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthenticated" });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid listing ID" });
        }

        const listing = await updateListingStatusService(id, userId, status);

        return res.status(200).json({ message: "Listing status updated successfully", listing });

    } catch (error) {
        console.error("Update Listing Status Error: ", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyListings(req: Request, res: Response) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Authentication Required" });
        }

        const { page, limit } = res.locals.validatedQuery

        const result = await getMyListingsService(userId, page, limit);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Get My Listing Error:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message })
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getListings(req: Request, res: Response) {
    try {
        const { page, limit, categoryId, condition, minPrice, maxPrice, sort, search } = res.locals.validatedQuery;

        const result = await getListingsService(page, limit, { categoryId, condition, minPrice, maxPrice, search }, sort);

        return res.status(200).json(result);

    } catch (error) {
        console.error("Get Listings Error:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message })
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
}