import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import type { Context } from 'hono';
import type IORedis from 'ioredis';
import type { JobsOptions } from 'bullmq';
export interface EmailJobData {
    to: string;
    subject: string;
    body: string;
    template?: string;
}
export interface ProcessImageJobData {
    imageUrl: string;
    transformations: string[];
    userId: string;
}
export interface ScheduledTaskData {
    taskType: string;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface JobQueueConfig {
    redis: IORedis;
    concurrency?: number;
    defaultJobOptions?: {
        removeOnComplete?: number;
        removeOnFail?: number;
        attempts?: number;
        backoff?: {
            type: 'exponential' | 'fixed';
            delay: number;
        };
    };
}
export interface EventTriggeredJobData {
    eventType: string;
    eventId: string;
    payload: any;
    userId?: string;
    timestamp: number;
}
export declare class JobQueueManager {
    private config;
    private queues;
    private workers;
    private queueEvents;
    private redis;
    constructor(config: JobQueueConfig);
    getQueue(name: string): Queue;
    addJob<T = any>(queueName: string, jobName: string, data: T, options?: JobsOptions): Promise<Job<any, any, string>>;
    scheduleJob<T = any>(queueName: string, jobName: string, data: T, scheduledAt: Date): Promise<Job<any, any, string>>;
    addRecurringJob<T = any>(queueName: string, jobName: string, data: T, cronExpression: string, options?: {
        limit?: number;
    }): Promise<Job<any, any, string>>;
    setupWorker<T = any>(queueName: string, processor: (job: Job<T>) => Promise<any>, options?: {
        concurrency?: number;
        onCompleted?: (job: Job<T>, result: any) => void;
        onFailed?: (job: Job<T> | undefined, error: Error, prev?: string) => void;
        onProgress?: (job: Job<T>, progress: any) => void;
        onError?: (error: Error) => void;
    }): Worker<any, any, string> | Worker<T, any, string>;
    setupQueueEvents(queueName: string, customHandlers?: {
        onWaiting?: (args: {
            jobId: string;
            prev?: string;
        }) => void;
        onActive?: (args: {
            jobId: string;
            prev?: string;
        }) => void;
        onCompleted?: (args: {
            jobId: string;
            returnvalue: any;
            prev?: string;
        }) => void;
        onFailed?: (args: {
            jobId: string;
            failedReason: string;
            prev?: string;
        }) => void;
        onProgress?: (args: {
            jobId: string;
            data: any;
            prev?: string;
        }) => void;
        onStalled?: (args: {
            jobId: string;
            prev?: string;
        }) => void;
    }): QueueEvents;
    getQueueStats(queueName: string): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
    cleanQueue(queueName: string, olderThan?: number): Promise<void>;
    close(): Promise<void>;
}
export declare function processEmailJob(job: Job<EmailJobData>): Promise<{
    sent: boolean;
    messageId: string;
    recipient: string;
}>;
export declare function processImageJob(job: Job<ProcessImageJobData>): Promise<{
    processedUrl: string;
    transformations: string[];
    userId: string;
    processingTime: number;
}>;
export declare function processEventJob(job: Job<EventTriggeredJobData>): Promise<{
    processed: boolean;
    eventType: "user.created" | "order.completed" | "subscription.expiring";
    eventId: string;
    processingTime: number;
}>;
export declare function processScheduledTask(job: Job<ScheduledTaskData>): Promise<{
    completed: boolean;
    taskType: "cleanup_expired_tokens" | "generate_weekly_report" | "backup_database" | "send_daily_digest";
    userId: string | undefined;
    metadata: Record<string, any> | undefined;
    completedAt: string;
}>;
export declare function createJobQueueMiddleware(jobManager: JobQueueManager): (c: Context, next: any) => Promise<void>;
export declare function triggerJobFromEvent(jobManager: JobQueueManager, eventType: string, payload: any, options?: {
    delay?: number;
    userId?: string;
    priority?: number;
}): Promise<Job<any, any, string>>;
export declare class SagaOrchestrator {
    private jobManager;
    constructor(jobManager: JobQueueManager);
    startSaga(sagaType: string, initialData: any, steps: string[]): Promise<string>;
    processSagaStep(job: Job): Promise<{
        sagaId: any;
        status: string;
        completedAt: string;
        step?: undefined;
    } | {
        sagaId: any;
        status: string;
        step: any;
        completedAt?: undefined;
    }>;
    private executeStep;
    private executeOrderProcessingStep;
    private executeUserOnboardingStep;
    private startCompensation;
}
export { Queue, Worker, QueueEvents, Job };
//# sourceMappingURL=job-que-scheduler.d.ts.map