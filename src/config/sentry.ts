import * as Sentry from '@sentry/node';
import { env } from './env.js';    

Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 0.1,
});

export const toSentryLevel = (level: "debug" | "info" | "warn" | "error"): Sentry.SeverityLevel => {
    switch (level) {
        case "warn": return "warning";
        case "debug":
        case "info":
        case "error": return level;
        default: return "info";
    }
};
export { Sentry };
