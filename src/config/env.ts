import { z } from 'zod';
import 'dotenv/config';
export const EnvSchema = z.object({
    VALKEY_URI: z.string().url(),
    SENTRY_DSN: z.string().url(),
    JWT_PUBLIC_KEY: z.string(),
    JWT_PRIVATE_KEY: z.string(),
    NODE_ENV: z.string().default('development')
});

export const env = EnvSchema.parse(process.env);