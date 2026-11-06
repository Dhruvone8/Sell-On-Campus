import { Worker, Job } from "bullmq";
import connection from "../lib/queue/connection.js";
import { prisma } from "../lib/prisma.js"
import { sendWelcomeEmail } from "../services/email/email.service.js";

interface EmailJobData {
    outboxId: string;
}

const emailWorker = new Worker<EmailJobData>(
    "email-queue",
    async (job: Job<EmailJobData>) => {
        console.log(`[EmailWorker] Processing Job: ${job.id}`);

        const outbox = await prisma.emailOutbox.findUnique({
            where: {
                id: job.data.outboxId
            }
        })

        if (!outbox) {
            throw new Error(`Email outbox record not found: ${job.data.outboxId}`)
        }

        if (outbox.status === "SENT") {
            console.log(`[EmailWorker] Email already sent: ${outbox.id}`);
            return;
        }

        if (outbox.type === "WELCOME_EMAIL") {
            const payload = outbox.payload as {
                email: string;
                name: string;
            };

            await sendWelcomeEmail(payload.email, payload.name, `welcome-email-${outbox.id}`)

            await prisma.$transaction([
                prisma.emailOutbox.update({
                    where: { id: outbox.id },
                    data: {
                        status: "SENT",
                        sentAt: new Date(),
                        attempts: { increment: 1 },
                        lastError: null
                    },
                }),

                prisma.user.update({
                    where: { id: outbox.userId },
                    data: {
                        welcomeEmailSentAt: new Date()
                    },
                }),
            ]);

            console.log(`[EmailWorker] Welcome email sent: ${outbox.id}`);
        } else {
            throw new Error(`Unsupported email type: ${outbox.type}`);
        }
    },
    {
        connection,
        concurrency: 5,
    }
);

emailWorker.on("completed", (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed`);
});

emailWorker.on("failed", async (job, error) => {
    console.error(`[EmailWorker] Job: ${job?.id} failed `, error.message);

    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
        await prisma.emailOutbox.updateMany({
            where: {
                id: job.data.outboxId,
                status: { not: "SENT" },
            },
            data: {
                status: "FAILED",
                attempts: job.attemptsMade,
                lastError: error.message,
            },
        });
    }
});

console.log("[EmailWorker] Email worker is running...");

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
    if (isShuttingDown) return;

    isShuttingDown = true;

    console.log(`\n[EmailWorker] ${signal} received. Shutting down...`);

    try {
        // Stop accepting new jobs and wait for active jobs
        await emailWorker.close();

        console.log("[EmailWorker] Worker closed.");

        // Close Prisma connection
        await prisma.$disconnect();

        console.log("[EmailWorker] Prisma disconnected.");

        // Close BullMQ Redis connection
        await connection.quit();

        console.log("[EmailWorker] Redis connection closed.");

        console.log("[EmailWorker] Graceful shutdown complete.");

        process.exit(0);
    } catch (error) {
        console.error("[EmailWorker] Shutdown error:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void gracefulShutdown("SIGINT"));