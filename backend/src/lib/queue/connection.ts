import {Redis} from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null })

connection.on("error", (error) => {
    console.error("BullMQ Redis Connection Error: ", error);
})

export default connection;