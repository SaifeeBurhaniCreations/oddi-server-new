import type { Context, Next } from 'hono';
import { JWT_CONFIG } from '../constants/jwtAuth.js';

export const jwtConfigMiddleware = async (c: Context, next: Next) => {
    c.set('jwtConfig', JWT_CONFIG);
    await next();
};

