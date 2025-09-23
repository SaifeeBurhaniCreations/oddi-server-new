import type { Context, Next } from 'hono';
import  { redis } from "../config/infra/redis.js"

export const redisMiddleware = async (c: Context, next: Next) => {
    c.set('redis', redis);
    await next();
};
