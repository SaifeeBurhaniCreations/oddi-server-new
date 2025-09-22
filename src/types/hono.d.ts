import type { Consumer, Producer } from "kafkajs";
import { S3Client } from "../../sbc/utils/s3-image-uploader/s3-image-uploader.js"
import type { PrismaClient } from ".prisma/client/client.js";
import type Redis from "ioredis";

declare module 'hono' {
    interface ContextVariableMap {
        validated: Record<string, unknown>;
        parsedQuery: Record<string, string>;
        prisma: PrismaClient;
        producer: Producer;
        consumer: Consumer;
        redis: Redis;
        s3: S3Client;
    }
}