import { jobManager } from './jobQueueManager.js';
import {
  processEmailJob,
  processEventJob,
  processScheduledTask,
} from './processors.js';

jobManager.setupWorker('emails', processEmailJob);
jobManager.setupWorker('events', processEventJob);
jobManager.setupWorker('scheduled-tasks', processScheduledTask);

console.log("BullMQ workers ready and listening!");
