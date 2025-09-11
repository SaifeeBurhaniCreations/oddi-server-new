import type { Context, MiddlewareHandler } from 'hono';
import type Redis from 'ioredis';
export interface RateLimiterConfig {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: (c: Context) => string;
    redis?: Redis;
    algorithm?: 'fixed-window' | 'sliding-window' | 'token-bucket';
    onLimitReached?: (c: Context) => void;
}
export declare function rateLimiter(cfg: RateLimiterConfig): MiddlewareHandler;
//# sourceMappingURL=rate-limiter.d.ts.map