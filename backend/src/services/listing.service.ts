import { prisma } from "../lib/prisma.js"
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/error.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js"
import { getCache, setCache, deleteCache } from "../lib/cache/cache.js"

type ListingWithRelations = Prisma.ListingGetPayload<{
    include: {
        category: true;
        images: true;
        seller: {
            select: {
                id: true;
                name: true;
                department: true;
                year: true;
                profileImageUrl: true;
                createdAt: true;
            };
        };
    };
}>;

type ListingResponse = Omit<ListingWithRelations, "images"> & {
    images: {
        id: string;
        imageUrl: string;
    }[];
};

type ListingsResponse = {
    listings: ListingResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

const listingDetailArgs = {
    include: {
        category: true,
        images: {
            orderBy: {
                createdAt: "asc" as const
            }
        },
        seller: {
            select: {
                id: true,
                name: true,
                department: true,
                year: true,
                profileImageUrl: true,
                createdAt: true,
            },
        },
    },
} satisfies Prisma.ListingDefaultArgs;

type ListingDetail = Prisma.ListingGetPayload<typeof listingDetailArgs>;

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
    deletedImageIds?: string[];
    imageOrder?: Array<{
        type: "existing" | "new";
        id?: string;
        index?: number;
    }>;
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
        // Phase 1: Upload ALL images to Cloudinary
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
        // create ListingImage records.
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

        await deleteCache("listings:feed:p1:l10:newest");

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
    const cachedKey = `listing:${listingId}`;

    const cachedListing = await getCache<ListingDetail>(cachedKey);

    if (cachedListing) {
        return cachedListing;
    }

    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId
        },
        include: {
            category: true,
            images: true,
            seller: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    year: true,
                    profileImageUrl: true,
                    createdAt: true
                }
            }
        }
    });

    if (!listing) {
        throw new AppError("Listing not Found", 404);
    }

    const result = {
        ...listing,
        images: listing.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
        })),
    };

    await setCache(cachedKey, result, 60 * 10)

    return result
}

export async function updateListing(
    listingId: string,
    userId: string,
    data: UpdateListingData,
    files?: Express.Multer.File[]
) {
    const listing = await prisma.listing.findUnique({
        where: {
            id: listingId
        },
        include: {
            images: true
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

    // 1. Delete requested images
    if (data.deletedImageIds && data.deletedImageIds.length > 0) {
        const imagesToDelete = listing.images.filter((img) =>
            data.deletedImageIds!.includes(img.id)
        );

        for (const image of imagesToDelete) {
            try {
                await deleteImage(image.publicId);
            } catch (err) {
                console.error("Failed to delete Cloudinary image:", image.publicId, err);
            }
        }

        if (imagesToDelete.length > 0) {
            await prisma.listingImage.deleteMany({
                where: {
                    id: { in: imagesToDelete.map((img) => img.id) },
                    listingId: listingId
                }
            });
        }
    }

    // 2. Upload new images if any
    const uploadedNewRecords: { id: string; fileIndex: number }[] = [];
    if (files && files.length > 0) {
        const remainingImagesCount = listing.images.filter(
            (img) => !data.deletedImageIds?.includes(img.id)
        ).length;

        if (remainingImagesCount + files.length > 5) {
            throw new AppError("A listing can have at most 5 photos", 400);
        }

        const uploadedImages: { secure_url: string; public_id: string; fileIndex: number }[] = [];
        try {
            for (const [i, file] of files.entries()) {
                const result = await uploadImage(
                    file.buffer,
                    `sell-on-campus/listings/${listing.id}`
                );
                uploadedImages.push({ ...result, fileIndex: i });
            }

            for (const img of uploadedImages) {
                const record = await prisma.listingImage.create({
                    data: {
                        imageUrl: img.secure_url,
                        publicId: img.public_id,
                        listingId: listing.id
                    }
                });
                uploadedNewRecords.push({ id: record.id, fileIndex: img.fileIndex });
            }
        } catch (uploadError) {
            for (const img of uploadedImages) {
                try {
                    await deleteImage(img.public_id);
                } catch (cleanupErr) {
                    console.error("Failed to cleanup Cloudinary image on error:", img.public_id, cleanupErr);
                }
            }
            throw uploadError;
        }
    }

    // 3. Apply custom image ordering if specified
    if (data.imageOrder && data.imageOrder.length > 0) {
        const baseTime = Date.now();
        for (const [i, item] of data.imageOrder.entries()) {
            let targetImageId: string | undefined;

            if (item.type === "existing" && item.id) {
                targetImageId = item.id;
            } else if (item.type === "new" && item.index !== undefined) {
                const found = uploadedNewRecords.find((rec) => rec.fileIndex === item.index);
                if (found) targetImageId = found.id;
            }

            if (targetImageId) {
                await prisma.listingImage.update({
                    where: { id: targetImageId },
                    data: {
                        createdAt: new Date(baseTime + i * 1000)
                    }
                });
            }
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

    const updatedListing = await prisma.listing.update({
        where: {
            id: listingId
        },
        data: updateData,
        include: {
            category: true,
            images: {
                orderBy: {
                    createdAt: "asc"
                }
            },
            seller: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    year: true,
                    profileImageUrl: true,
                    createdAt: true
                }
            }
        }
    });

    await deleteCache(`listing:${listingId}`);
    await deleteCache("listings:feed:p1:l10:newest");

    return {
        ...updatedListing,
        images: updatedListing.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
        }))
    };
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

    const updatedListing = await prisma.listing.update({
        where: {
            id: listingId,
        },
        data: {
            status: newStatus
        }
    });

    await deleteCache(`listing:${listingId}`);
    await deleteCache("listings:feed:p1:l10:newest");

    return updatedListing;
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
                images: {
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        year: true,
                        profileImageUrl: true,
                        createdAt: true
                    }
                }
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
        category?: string;
        condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
        minPrice?: number;
        maxPrice?: number;
        search?: string
    },
    sort: ListingSort
) {
    const isDefaultFeed =
        page === 1 &&
        limit === 10 &&
        sort === "newest" &&
        !filters.categoryId &&
        !filters.category &&
        !filters.condition &&
        filters.minPrice === undefined &&
        filters.maxPrice === undefined &&
        !filters.search;

    const cacheKey = "listings:feed:p1:l10:newest";

    if (isDefaultFeed) {
        const cachedListings = await getCache<ListingsResponse>(cacheKey);

        if (cachedListings) {
            return cachedListings;
        }
    }
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
        status: "ACTIVE" as const,

        ...(filters.categoryId && { categoryId: filters.categoryId }),

        ...(filters.category && {
            category: { name: { contains: filters.category, mode: "insensitive" } }
        }),

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
                { model: { contains: filters.search, mode: "insensitive" } },
                { category: { name: { contains: filters.search, mode: "insensitive" } } }
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
                images: {
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        year: true,
                        profileImageUrl: true,
                        createdAt: true
                    }
                }
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

    const result: ListingsResponse = {
        listings: listingsWithImages,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };

    if (isDefaultFeed) {
        await setCache(cacheKey, result, 60);
    }

    return result;
}

export async function getCategories() {
    const cacheKey = "categories:all";

    const cachedCategories = await getCache<
        Awaited<ReturnType<typeof prisma.category.findMany>>
    >(cacheKey);

    if (cachedCategories) return cachedCategories;

    const categories = await prisma.category.findMany({
        orderBy: {
            name: "asc"
        }
    });

    await setCache(cacheKey, categories, 60 * 60 * 24);

    return categories;
}