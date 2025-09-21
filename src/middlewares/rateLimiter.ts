import { rateLimiter } from '../sbc/utils/rate-limiter/rate-limiter.js';
import { redis } from '../config/infra/redis.js';

export const apiRateLimiter = rateLimiter({
    windowMs: 15_000,
    max: 5,
    redis,
    algorithm: "sliding-window",
    message: "Slow down! Too many requests 🚦",
    keyGenerator: (c) => (
        c.req.header("x-api-key") ||
        c.req.header("x-forwarded-for") ||
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-real-ip") ||
        "global"
    ),
    onLimitReached: (c) => {
        console.log("Rate limit hit for", c.req.header("x-forwarded-for"));
    }
});
