import type { Context, Next } from 'hono';
import { producer, consumer } from '../config/infra/kafka.js';

export const kafkaMiddleware = async (c: Context, next: Next) => {
    c.set('producer', producer);
    c.set('consumer', consumer);
    await next();
};
