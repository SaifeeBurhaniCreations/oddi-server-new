import type { Context, Next } from 'hono';
import { prisma } from '../config/infra/prisma.js';

export const prismaMiddleware = async (c: Context, next: Next) => {
    c.set('prisma', prisma);
    await next();
};
