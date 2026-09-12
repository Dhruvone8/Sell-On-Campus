import { prisma } from "../lib/prisma.js"
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/error.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js"

interface CreateListingData {
    sellerId: string;
    title: string;
    description: string;
    price: number;
    categoryId: string;
    condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
    brand?: string;
    color?: string;
    model?: string;
    files?: Express.Multer.File[];
}

interface UpdateListingData {
    title?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
    brand?: string | null;
    color?: string | null;
    model?: string | null;
}

type ListingSort =
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc";

export async function createListing(data: CreateListingData) {
    const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const listing = await prisma.listing.create({
        data: {
            sellerId: data.sellerId,
            title: data.title,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            condition: data.condition,
            ...(data.brand !== undefined && { brand: data.brand }),
            ...(data.color !== undefined && { color: data.color }),
            ...(data.model !== undefined && { model: data.model })
        }
    });

    const uploadedImages: {
        secure_url: string;
        public_id: string;
    }[] = [];

    try {
        // Phase 1: upload ALL images to Cloudinary
        if (data.files && data.files.length > 0) {
            for (const file of data.files) {
                const result = await uploadImage(
                    file.buffer,
                    `sell-on-campus/listings/${listing.id}`
                );

                uploadedImages.push(result);
            }
        }

        // Phase 2: ALL uploads succeeded.
        // Now create ListingImage records.
        const imageRecords = await Promise.all(
            uploadedImages.map((image) =>
                prisma.listingImage.create({
                    data: {
                        imageUrl: image.secure_url,
                        publicId: image.public_id,
                        listingId: listing.id
                    }
                })
            )
        );

        return {
            ...listing,
            images: imageRecords
        };
    } catch (error) {
        // Remove any Cloudinary images that were successfully uploaded.
        for (const image of uploadedImages) {
            try {
                await deleteImage(image.public_id);
            } catch (cleanupError) {
                console.error(
                    "Failed to cleanup Cloudinary image:",
                    image.public_id,
                    cleanupError
                );
            }
        }

        // Remove the listing.
        // ListingImage rows, if any, are removed through onDelete: Cascade.
        try {
            await prisma.listing.delete({
                where: { id: listing.id }
            });
        } catch (cleanupError) {
            console.error(
                "Failed to cleanup listing:",
                listing.id,
                cleanupError
            );
        }

        throw error;
    }
}

export async function getListingById(listingId: string) {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId
        },
        include: {
            category: true,
            images: true
        }
    });

    if (!listing) {
        throw new AppError("Listing not Found", 404);
    }

    return {
        ...listing, images: listing.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl
        }))
    }
}

export async function updateListing(listingId: string, userId: string, data: UpdateListingData) {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId
        }
    });

    if (!listing) {
        throw new AppError("Listing not Found", 404);
    }

    if (listing.sellerId !== userId) {
        throw new AppError("You are not authorized to update this listing", 403);
    }

    if (data.categoryId !== undefined) {
        const category = await prisma.category.findUnique({
            where: {
                id: data.categoryId
            }
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }
    }

    const updateData = {
        ...(data.title !== undefined && { title: data.title }),

        ...(data.description !== undefined && { description: data.description }),

        ...(data.price !== undefined && { price: data.price }),

        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),

        ...(data.condition !== undefined && { condition: data.condition }),

        ...("brand" in data && { brand: data.brand }),

        ...("color" in data && { color: data.color }),

        ...("model" in data && { model: data.model })
    };

    return prisma.listing.update({
        where: {
            id: listingId
        },
        data: updateData
    });
}

export async function updateListingStatus(listingId: string, userId: string, newStatus: "ACTIVE" | "RESERVED" | "SOLD") {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId,
        }
    });

    if (!listing) {
        throw new AppError("Listing not Found", 404);
    }

    if (listing.sellerId !== userId) {
        throw new AppError("You are not authorized to update this listing", 403);
    }

    const validTransition =
        (listing.status === "ACTIVE" && newStatus === "RESERVED") ||
        (listing.status === "RESERVED" && newStatus === "ACTIVE") ||
        (listing.status === "RESERVED" && newStatus === "SOLD");

    if (!validTransition) {
        throw new AppError(`Cannot change status from ${listing.status} to ${newStatus}`, 400);
    }

    return prisma.listing.update({
        where: {
            id: listingId,
        },
        data: {
            status: newStatus
        }
    })
}

export async function getMyListings(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where: {
                sellerId: userId
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take: limit,
            include: {
                category: true,
                images: true
            }
        }),

        prisma.listing.count({
            where: {
                sellerId: userId
            }
        })
    ]);

    const totalPages = Math.ceil(total / limit);

    const listingsWithImages = listings.map((listing) => ({
        ...listing,
        images: listing.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl
        }))
    }));

    return {
        listings: listingsWithImages, pagination: { page, limit, total, totalPages }
    }
}

export async function getListings(
    page: number,
    limit: number,
    filters: {
        categoryId?: string;
        condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
        minPrice?: number;
        maxPrice?: number;
        search?: string
    },
    sort: ListingSort
) {
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
        status: "ACTIVE" as const,

        ...(filters.categoryId && { categoryId: filters.categoryId }),

        ...(filters.condition && { condition: filters.condition }),

        ...(filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
            price: {
                ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
                ...(filters.maxPrice !== undefined && { lte: filters.maxPrice })
            }
        },

        ...(filters.search && {
            OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { brand: { contains: filters.search, mode: "insensitive" } },
                { model: { contains: filters.search, mode: "insensitive" } }
            ]
        }),
    };

    const orderBy = {
        newest: { createdAt: "desc" as const },

        oldest: { createdAt: "asc" as const },

        price_asc: { price: "asc" as const },

        price_desc: { price: "desc" as const }
    }[sort];

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                category: true,
                images: true
            }
        }),

        prisma.listing.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    const listingsWithImages = listings.map((listing) => ({
        ...listing,
        images: listing.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl
        }))
    }));

    return { listings: listingsWithImages, pagination: { page, limit, total, totalPages } };
}

export async function uploadListingImage(listingId: string, userId: string, file: Express.Multer.File) {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId,
        }
    })

    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }

    if (listing.sellerId !== userId) {

    }
}