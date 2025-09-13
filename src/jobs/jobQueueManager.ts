import { JobQueueManager } from '../sbc/utils/job-que-scheduler/job-que-scheduler.js';
import { redis } from '../config/redis.js';
import type { Context, Next } from 'hono';

export const jobManager = new JobQueueManager({ redis });

export function createJobQueueMiddleware(jobManager: JobQueueManager) {
    return async (c: Context, next: Next) => {
        c.set('jobManager', jobManager);
        await next();
    };
}
