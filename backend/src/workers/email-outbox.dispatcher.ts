import { prisma } from "../lib/prisma.js";
import { emailQueue } from "../lib/queue/email.queue.js";

const BATCH_SIZE = 20;
const POLL_INTERVAL = 5000;

let dispatcherInterval: NodeJS.Timeout | null = null;
let isDispatching = false;

async function dispatchPendingEmails() {
    if (isDispatching) return;

    isDispatching = true;

    try {
        const pendingEmails = await prisma.emailOutbox.findMany({
            where: {
                status: "PENDING"
            },
            orderBy: {
                createdAt: "asc",
            },
            take: BATCH_SIZE
        });

        for (const email of pendingEmails) {
            try {
                await emailQueue.add(
                    email.type,
                    {
                        outboxId: email.id
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
                        dispatchedAt: new Date()
                    }
                });

                console.log(`[EmailDispatcher] Dispatched Email: ${email.id}`);
            } catch (error) {
                console.error(`[EmailDispatcher] Failed to dispatch email ${email.id}:`, error);
            }
        }
    } catch (error) {
        console.error("[EmailDispatcher] Failed to dispatch pending emails: ", error);
    } finally {
        isDispatching = false;
    }
}

export function startEmailOutboxDispatcher() {
    if (dispatcherInterval) return;

    console.log("[EmailDispatcher] Starting email outbox dispatcher...");

    void dispatchPendingEmails();

    dispatcherInterval = setInterval(() => {
        void dispatchPendingEmails();
    }, POLL_INTERVAL);
}

export function stopEmailOutboxDispatcher() {
    if (dispatcherInterval) {
        clearInterval(dispatcherInterval);
        dispatcherInterval = null;
    }

    console.log("[EmailDispatcher] Stopped email outbox dispatcher.");
}