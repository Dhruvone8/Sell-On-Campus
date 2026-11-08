import "dotenv/config";
import { Worker, Job } from "bullmq";
import connection from "../lib/queue/connection.js";
import { prisma } from "../lib/prisma.js";
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
    try {
        console.error(`[EmailWorker] Job: ${job?.id} failed:`, error.message);

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
            console.log(`[EmailWorker] Outbox record ${job.data.outboxId} marked as FAILED.`);
        }
    } catch (dbError) {
        console.error(
            `[EmailWorker] Failed to update outbox record ${job?.data?.outboxId} status to FAILED (PostgreSQL may be unreachable):`,
            dbError
        );
    }
});

console.log("[EmailWorker] Email worker is running...");

export async function closeEmailWorker() {
    console.log("[EmailWorker] Closing worker...");

    await emailWorker.close();

    console.log("[EmailWorker] Worker closed.");
}