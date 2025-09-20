import { JobQueueManager } from '../sbc/utils/job-que-scheduler/job-que-scheduler.js';
import { redis } from '../config/infra/redis.js';

export const jobQueueManager = new JobQueueManager({ redis });
