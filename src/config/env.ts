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
});

export const env = EnvSchema.parse(process.env);