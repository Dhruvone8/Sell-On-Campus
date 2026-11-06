import { Queue } from "bullmq"
import connection from "./connection.js"

export const emailQueue = new Queue("email-queue",
    {
        connection,

        defaultJobOptions: {
            attempts: 4,

            backoff: {
                type: "exponential",
                delay: 2000
            },

            removeOnComplete: {
                age: 3600,
                count: 1000,
            },

            removeOnFail: {
                age: 7 * 24 * 3600,
                count: 5000
            }
        }
    });