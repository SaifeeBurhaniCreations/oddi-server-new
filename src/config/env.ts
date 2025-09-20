import { z } from 'zod';
import 'dotenv/config';

export const EnvSchema = z.object({
    VALKEY_URI: z.url(),
    SENTRY_DSN: z.url(),
    JWT_PUBLIC_KEY: z.string(),
    JWT_PRIVATE_KEY: z.string(),
    NODE_ENV: z.string().default('development'),
    DATABASE_URL: z.url(),
    JSON_DATABASE_URL: z.url(),
    S3_BUCKET: z.string(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
});

export const env = EnvSchema.parse(process.env);