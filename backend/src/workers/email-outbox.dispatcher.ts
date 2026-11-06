import { prisma } from "../lib/prisma.js";
import { emailQueue } from "../lib/queue/email.queue.js";

const BATCH_SIZE = 20;
const POLL_INTERVAL = 5000;
const STALE_DISPATCH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const RECONCILIATION_INTERVAL_TICKS = 12; // Reconcile every ~60 seconds (12 * 5000ms)

let dispatcherInterval: NodeJS.Timeout | null = null;
let isDispatching = false;
let tickCount = 0;

async function dispatchPendingEmails() {
    const pendingEmails = await prisma.emailOutbox.findMany({
        where: {
            status: "PENDING",
        },
        orderBy: {
            createdAt: "asc",
        },
        take: BATCH_SIZE,
    });

    for (const email of pendingEmails) {
        try {
            await emailQueue.add(
                email.type,
                {
                    outboxId: email.id,
                },
                {
                    jobId: `email-outbox-${email.id}`,
                }
            );

            await prisma.emailOutbox.updateMany({
                where: {
                    id: email.id,
                    status: "PENDING",
                },
                data: {
                    status: "DISPATCHED",
                    dispatchedAt: new Date(),
                },
            });

            console.log(`[EmailDispatcher] Dispatched Email: ${email.id}`);
        } catch (error) {
            console.error(`[EmailDispatcher] Failed to dispatch email ${email.id}:`, error);
        }
    }
}

async function reconcileStaleDispatchedEmails() {
    try {
        const staleThreshold = new Date(Date.now() - STALE_DISPATCH_THRESHOLD_MS);

        const staleEmails = await prisma.emailOutbox.findMany({
            where: {
                status: "DISPATCHED",
                dispatchedAt: {
                    lte: staleThreshold,
                },
            },
            take: BATCH_SIZE,
        });

        if (staleEmails.length === 0) return;

        console.log(`[EmailDispatcher] Found ${staleEmails.length} stale DISPATCHED email(s). Reconciling...`);

        for (const email of staleEmails) {
            const jobId = `email-outbox-${email.id}`;

            try {
                const job = await emailQueue.getJob(jobId);

                if (!job) {
                    // Job is not in BullMQ (lost in Redis, crash, or eviction)
                    // First check if the user already received the email
                    const user = await prisma.user.findUnique({
                        where: { id: email.userId },
                        select: { welcomeEmailSentAt: true },
                    });

                    if (user?.welcomeEmailSentAt) {
                        console.log(`[EmailDispatcher] User ${email.userId} already received welcome email. Marking outbox as SENT.`);
                        await prisma.emailOutbox.update({
                            where: { id: email.id },
                            data: {
                                status: "SENT",
                                sentAt: user.welcomeEmailSentAt,
                            },
                        });
                        continue;
                    }

                    // Otherwise, re-queue the missing job
                    console.warn(`[EmailDispatcher] Job ${jobId} not found in BullMQ. Re-queueing stale email ${email.id}...`);

                    await emailQueue.add(
                        email.type,
                        {
                            outboxId: email.id,
                        },
                        {
                            jobId,
                        }
                    );

                    await prisma.emailOutbox.update({
                        where: { id: email.id },
                        data: {
                            dispatchedAt: new Date(),
                            attempts: { increment: 1 },
                        },
                    });

                    console.log(`[EmailDispatcher] Successfully re-queued email ${email.id}.`);
                    continue;
                }

                const state = await job.getState();

                if (state === "failed") {
                    // Terminal failure in BullMQ, but DB update failed previously (e.g. Postgres outage)
                    console.warn(`[EmailDispatcher] Job ${jobId} failed in BullMQ. Reconciling DB status to FAILED.`);

                    await prisma.emailOutbox.updateMany({
                        where: {
                            id: email.id,
                            status: { not: "SENT" },
                        },
                        data: {
                            status: "FAILED",
                            attempts: job.attemptsMade,
                            lastError: job.failedReason || "Job exhausted retries in BullMQ (reconciled)",
                        },
                    });
                } else if (state === "completed") {
                    // Job completed in BullMQ, but DB update to SENT was lost or interrupted
                    console.log(`[EmailDispatcher] Job ${jobId} is completed in BullMQ. Reconciling DB status to SENT.`);

                    await prisma.$transaction([
                        prisma.emailOutbox.update({
                            where: { id: email.id },
                            data: {
                                status: "SENT",
                                sentAt: new Date(),
                            },
                        }),
                        prisma.user.update({
                            where: { id: email.userId },
                            data: {
                                welcomeEmailSentAt: new Date(),
                            },
                        }),
                    ]);
                } else {
                    // Job is active, waiting, or delayed; BullMQ is still managing it
                    console.log(`[EmailDispatcher] Job ${jobId} is currently in state '${state}'. Waiting...`);
                }
            } catch (jobError) {
                console.error(`[EmailDispatcher] Failed to reconcile email ${email.id}:`, jobError);
            }
        }
    } catch (error) {
        console.error("[EmailDispatcher] Stale email reconciliation encountered an error:", error);
    }
}

async function runDispatcherCycle() {
    if (isDispatching) return;

    isDispatching = true;

    try {
        await dispatchPendingEmails();

        tickCount++;
        if (tickCount % RECONCILIATION_INTERVAL_TICKS === 0) {
            await reconcileStaleDispatchedEmails();
        }
    } catch (error) {
        console.error("[EmailDispatcher] Dispatcher cycle error:", error);
    } finally {
        isDispatching = false;
    }
}

export function startEmailOutboxDispatcher() {
    if (dispatcherInterval) return;

    console.log("[EmailDispatcher] Starting email outbox dispatcher...");

    void runDispatcherCycle();

    dispatcherInterval = setInterval(() => {
        void runDispatcherCycle();
    }, POLL_INTERVAL);
}

export function stopEmailOutboxDispatcher() {
    if (dispatcherInterval) {
        clearInterval(dispatcherInterval);
        dispatcherInterval = null;
    }

    console.log("[EmailDispatcher] Stopped email outbox dispatcher.");
}