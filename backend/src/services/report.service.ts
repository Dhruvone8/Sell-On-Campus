import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/error.js";
import { deleteCache } from "../lib/cache/cache.js";
import {
    sendWarningEmail,
    sendListingRemovalEmail,
    sendAccountSuspensionEmail,
    sendNewReportAlertEmail,
} from "./email/email.service.js";
import type { ReportReason, ReportStatus, ReportAction } from "../generated/prisma/client.js";

// --- Student: Submit Report ---

interface CreateReportInput {
    reporterId: string;
    reason: ReportReason;
    description?: string;
    listingId?: string;
    reportedUserId?: string;
}

export async function createReport(input: CreateReportInput) {
    const { reporterId, reason, description, listingId, reportedUserId } = input;

    if (reportedUserId && reportedUserId === reporterId) {
        throw new AppError("You cannot report yourself", 400);
    }

    let targetTitle = "Target";
    let sellerName: string | undefined;
    let sellerEmail: string | undefined;
    const targetType: "listing" | "user" = listingId ? "listing" : "user";

    // If reporting a listing, verify it exists and prevent self-report
    if (listingId) {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                sellerId: true,
                title: true,
                seller: { select: { id: true, name: true, email: true } },
            },
        });

        if (!listing) {
            throw new AppError("Listing not found", 404);
        }

        if (listing.sellerId === reporterId) {
            throw new AppError("You cannot report your own listing", 400);
        }

        // Always keep targetTitle as the listing's title for listing reports
        targetTitle = listing.title;
        if (listing.seller) {
            sellerName = listing.seller.name;
            sellerEmail = listing.seller.email;
        }
    } else if (reportedUserId) {
        // If reporting a user profile directly
        const user = await prisma.user.findUnique({
            where: { id: reportedUserId },
            select: { id: true, name: true },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        targetTitle = user.name;
    }

    // Prevent duplicate pending reports from the same reporter on the same target
    const existing = await prisma.report.findFirst({
        where: {
            reporterId,
            status: "PENDING",
            ...(listingId ? { listingId } : {}),
            ...(reportedUserId ? { reportedUserId } : {}),
        },
    });

    if (existing) {
        throw new AppError("You already have a pending report for this item", 409);
    }

    const report = await prisma.report.create({
        data: {
            reporterId,
            reason,
            ...(description ? { description } : {}),
            ...(listingId ? { listingId } : {}),
            ...(reportedUserId ? { reportedUserId } : {}),
        },
        select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
        },
    });

    // Notify administrators asynchronously (email + in-app notification)
    try {
        const [reporter, admins] = await Promise.all([
            prisma.user.findUnique({
                where: { id: reporterId },
                select: { name: true, email: true },
            }),
            prisma.user.findMany({
                where: { role: "ADMIN", status: "ACTIVE" },
                select: { id: true, email: true },
            }),
        ]);

        const adminEmails = new Set<string>();
        for (const admin of admins) {
            adminEmails.add(admin.email);
        }

        if (process.env.ADMIN_EMAIL) {
            adminEmails.add(process.env.ADMIN_EMAIL);
        }

        const emailList = Array.from(adminEmails);
        const emailPromises = emailList.map((email) =>
            sendNewReportAlertEmail(email, {
                reason,
                ...(description ? { description } : {}),
                targetTitle,
                targetType,
                sellerName,
                sellerEmail,
                reporterName: reporter?.name || "Student",
                reporterEmail: reporter?.email || "Unknown",
            })
        );

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    message: `New report submitted: ${reason.replace(/_/g, " ")} on "${targetTitle}". Review in Moderation Queue.`,
                })),
            });
        }

        const results = await Promise.allSettled(emailPromises);
        results.forEach((res, idx) => {
            if (res.status === "rejected") {
                console.error(`Failed to send report alert email to ${emailList[idx]}:`, res.reason);
            }
        });
    } catch (notifyError) {
        console.error("Failed to notify admins of new report:", notifyError);
    }

    return report;
}

interface ListReportsInput {
    page: number;
    limit: number;
    status?: ReportStatus;
    reason?: ReportReason;
}

export async function listReports(input: ListReportsInput) {
    const { page, limit, status, reason } = input;
    const skip = (page - 1) * limit;

    const where = {
        ...(status ? { status } : {}),
        ...(reason ? { reason } : {}),
    };

    const [reports, total] = await Promise.all([
        prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                reason: true,
                description: true,
                status: true,
                actionTaken: true,
                createdAt: true,
                reporter: {
                    select: { id: true, name: true, email: true },
                },
                listing: {
                    select: { id: true, title: true, status: true },
                },
                reportedUser: {
                    select: { id: true, name: true, email: true, status: true },
                },
            },
        }),
        prisma.report.count({ where }),
    ]);

    return {
        reports,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// --- Admin: Get Report Detail ---

export async function getReportById(reportId: string) {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            reason: true,
            description: true,
            status: true,
            actionTaken: true,
            resolutionNotes: true,
            resolvedAt: true,
            createdAt: true,
            reporter: {
                select: { id: true, name: true, email: true },
            },
            listing: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    condition: true,
                    status: true,
                    images: { select: { imageUrl: true }, take: 5 },
                    seller: { select: { id: true, name: true, email: true } },
                },
            },
            reportedUser: {
                select: { id: true, name: true, email: true, status: true },
            },
            reviewedBy: {
                select: { id: true, name: true },
            },
        },
    });

    if (!report) {
        throw new AppError("Report not found", 404);
    }

    return report;
}

interface ResolveReportInput {
    reportId: string;
    adminId: string;
    action: ReportAction;
    notes?: string;
}

export async function resolveReport(input: ResolveReportInput) {
    const { reportId, adminId, action, notes } = input;

    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: {
            id: true,
            status: true,
            reason: true,
            listingId: true,
            reportedUserId: true,
            listing: {
                select: { id: true, title: true, seller: { select: { id: true, email: true } } },
            },
            reportedUser: {
                select: { id: true, email: true },
            },
        },
    });

    if (!report) {
        throw new AppError("Report not found", 404);
    }

    if (report.status === "RESOLVED") {
        throw new AppError("This report has already been resolved", 400);
    }

    // Update the report with resolution data
    await prisma.report.update({
        where: { id: reportId },
        data: {
            status: "RESOLVED",
            actionTaken: action,
            ...(notes ? { resolutionNotes: notes } : {}),
            reviewedById: adminId,
            resolvedAt: new Date(),
        },
    });

    // Execute the resolution action
    try {
        switch (action) {
            case "DISMISSED":
                // No action needed on listing or user
                break;

            case "WARNING_ISSUED": {
                const targetEmail = report.reportedUser?.email || report.listing?.seller.email;
                if (targetEmail) {
                    await sendWarningEmail(targetEmail, report.reason, notes);
                }
                break;
            }

            case "LISTING_REMOVED": {
                if (report.listingId && report.listing) {
                    await prisma.listing.update({
                        where: { id: report.listingId },
                        data: { status: "REMOVED_BY_ADMIN" },
                    });

                    await deleteCache(`listing:${report.listingId}`);
                    await deleteCache("listings:feed:p1:l10:newest");

                    await sendListingRemovalEmail(
                        report.listing.seller.email,
                        report.listing.title,
                        report.reason,
                        notes,
                    );
                }
                break;
            }

            case "USER_SUSPENDED":
            case "USER_BANNED": {
                const userStatus = action === "USER_SUSPENDED" ? "SUSPENDED" : "BANNED";
                const targetUser = report.reportedUser || (report.listing ? { id: report.listing.seller.id, email: report.listing.seller.email } : null);

                if (targetUser) {
                    // Update user status and hide all their active listings
                    await prisma.$transaction([
                        prisma.user.update({
                            where: { id: targetUser.id },
                            data: { status: userStatus },
                        }),
                        prisma.listing.updateMany({
                            where: {
                                sellerId: targetUser.id,
                                status: "ACTIVE",
                            },
                            data: { status: "REMOVED_BY_ADMIN" },
                        }),
                    ]);

                    await deleteCache("listings:feed:p1:l10:newest");
                    if (report.listingId) {
                        await deleteCache(`listing:${report.listingId}`);
                    }

                    await sendAccountSuspensionEmail(
                        targetUser.email,
                        action,
                        report.reason,
                        notes,
                    );
                }
                break;
            }
        }
    } catch (emailError) {
        // Log email failures but don't fail the request — the DB resolution succeeded
        console.error("Failed to send moderation email:", emailError);
    }

    return { message: "Report resolved successfully" };
}
