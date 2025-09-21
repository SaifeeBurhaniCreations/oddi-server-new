import { Queue, Worker, QueueEvents, Job } from 'bullmq';
export class jobQueueManager {
    config;
    queues = new Map();
    workers = new Map();
    queueEvents = new Map();
    redis;
    constructor(config) {
        this.config = config;
        this.redis = config.redis;
    }
    getQueue(name) {
        if (!this.queues.has(name)) {
            const queue = new Queue(name, {
                connection: this.redis,
                defaultJobOptions: this.config.defaultJobOptions ?? {
                    removeOnComplete: 100,
                    removeOnFail: 50,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            });
            this.queues.set(name, queue);
        }
        return this.queues.get(name);
    }
    async addJob(queueName, jobName, data, options) {
        const queue = this.getQueue(queueName);
        return await queue.add(jobName, data, options);
    }
    async scheduleJob(queueName, jobName, data, scheduledAt) {
        const delay = scheduledAt.getTime() - Date.now();
        if (delay <= 0) {
            throw new Error('Scheduled time must be in the future');
        }
        return await this.addJob(queueName, jobName, data, { delay });
    }
    async addRecurringJob(queueName, jobName, data, cronExpression, options) {
        return await this.addJob(queueName, jobName, data, {
            repeat: {
                pattern: cronExpression,
                limit: options?.limit,
            },
        });
    }
    setupWorker(queueName, processor, options) {
        if (this.workers.has(queueName)) {
            return this.workers.get(queueName);
        }
        const workerOptions = {
            connection: this.redis,
            concurrency: options?.concurrency ?? this.config.concurrency ?? 5,
        };
        const worker = new Worker(queueName, processor, workerOptions);
        if (options?.onCompleted) {
            worker.on('completed', (job, result) => {
                options.onCompleted(job, result);
            });
        }
        if (options?.onFailed) {
            worker.on('failed', (job, error, prev) => {
                options.onFailed(job, error, prev);
            });
        }
        if (options?.onProgress) {
            worker.on('progress', (job, progress) => {
                options.onProgress(job, progress);
            });
        }
        worker.on('error', (error) => {
            console.error(`Worker error in queue ${queueName}:`, error);
            options?.onError?.(error);
        });
        worker.on('active', (job) => {
            console.log(`Job ${job.id} is now active in worker for queue ${queueName}`);
        });
        worker.on('stalled', (jobId) => {
            console.warn(`Job ${jobId} stalled in queue ${queueName}`);
        });
        worker.on('drained', () => {
            console.log(`Queue ${queueName} is drained (no more jobs)`);
        });
        this.workers.set(queueName, worker);
        return worker;
    }
    setupQueueEvents(queueName, customHandlers) {
        if (this.queueEvents.has(queueName)) {
            return this.queueEvents.get(queueName);
        }
        const queueEvents = new QueueEvents(queueName, {
            connection: this.redis,
        });
        queueEvents.on('waiting', (args) => {
            console.log(`Job ${args.jobId} is waiting in queue ${queueName}`);
            customHandlers?.onWaiting?.(args);
        });
        queueEvents.on('active', (args) => {
            console.log(`Job ${args.jobId} is now active in queue ${queueName}`);
            customHandlers?.onActive?.(args);
        });
        queueEvents.on('completed', (args) => {
            console.log(`Job ${args.jobId} completed in queue ${queueName}:`, args.returnvalue);
            customHandlers?.onCompleted?.(args);
        });
        queueEvents.on('failed', (args) => {
            console.error(`Job ${args.jobId} failed in queue ${queueName}:`, args.failedReason);
            customHandlers?.onFailed?.(args);
        });
        queueEvents.on('progress', (args) => {
            console.log(`Job ${args.jobId} progress in queue ${queueName}:`, args.data);
            customHandlers?.onProgress?.(args);
        });
        queueEvents.on('stalled', (args) => {
            console.warn(`Job ${args.jobId} stalled in queue ${queueName}`);
            customHandlers?.onStalled?.(args);
        });
        queueEvents.on('removed', (args) => {
            console.log(`Job ${args.jobId} removed from queue ${queueName}`);
        });
        this.queueEvents.set(queueName, queueEvents);
        return queueEvents;
    }
    // Get queue statistics
    async getQueueStats(queueName) {
        const queue = this.getQueue(queueName);
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const failed = await queue.getFailed();
        const delayed = await queue.getDelayed();
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            delayed: delayed.length,
        };
    }
    async cleanQueue(queueName, olderThan = 24 * 60 * 60 * 1000) {
        const queue = this.getQueue(queueName);
        await queue.clean(olderThan, 100, 'completed');
        await queue.clean(olderThan, 100, 'failed');
    }
    async close() {
        const closePromises = [];
        for (const worker of this.workers.values()) {
            closePromises.push(worker.close());
        }
        for (const queueEvents of this.queueEvents.values()) {
            closePromises.push(queueEvents.close());
        }
        for (const queue of this.queues.values()) {
            closePromises.push(queue.close());
        }
        await Promise.all(closePromises);
    }
}
// Job Processors
export async function processEmailJob(job) {
    try {
        const { to, subject, body, template } = job.data;
        if (!to || !subject) {
            throw new Error('Missing required email fields: to, subject');
        }
        await job.updateProgress(10);
        await job.log(`Starting email send to ${to}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await job.updateProgress(50);
        await job.log('Email service called successfully');
        // Here we'd integrate email service (SendGrid, SES, etc.)
        // const result = await emailService.send({ to, subject, body, template })
        await job.updateProgress(100);
        await job.log('Email sent successfully');
        return { sent: true, messageId: `msg_${Date.now()}`, recipient: to };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await job.log(`Email processing failed: ${errorMessage}`);
        throw error;
    }
}
export async function processImageJob(job) {
    try {
        const { imageUrl, transformations, userId } = job.data;
        if (!imageUrl || !transformations?.length) {
            throw new Error('Missing required image processing data');
        }
        await job.updateProgress(10);
        await job.log(`Starting image processing for user ${userId}`);
        const results = [];
        for (let i = 0; i < transformations.length; i++) {
            const transformation = transformations[i];
            await job.log(`Processing transformation ${i + 1}/${transformations.length}: ${transformation}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            results.push(`${transformation}_applied`);
            const progress = 10 + ((i + 1) / transformations.length) * 80;
            await job.updateProgress(progress);
        }
        await job.updateProgress(100);
        await job.log('Image processing completed');
        return {
            processedUrl: `${imageUrl}_processed`,
            transformations: results,
            userId,
            processingTime: Date.now() - job.timestamp,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await job.log(`Image processing failed: ${errorMessage}`);
        throw error;
    }
}
export async function processEventJob(job) {
    try {
        const { eventType, eventId, payload, userId, timestamp } = job.data;
        await job.log(`Processing event: ${eventType} (${eventId}) for user: ${userId || 'anonymous'}`);
        await job.updateProgress(10);
        switch (eventType) {
            case 'user.created':
                await job.updateProgress(30);
                await job.log('Sending welcome email...');
                // await sendWelcomeEmail(payload.email)
                await job.updateProgress(70);
                await job.log('Setting up user profile...');
                // await setupUserProfile(payload.userId)
                break;
            case 'order.completed':
                await job.updateProgress(25);
                await job.log('Updating inventory...');
                // await updateInventory(payload.items)
                await job.updateProgress(50);
                await job.log('Sending order confirmation...');
                // await sendOrderConfirmation(payload.orderId)
                await job.updateProgress(75);
                await job.log('Processing analytics...');
                // await trackOrderAnalytics(payload)
                break;
            case 'subscription.expiring':
                await job.updateProgress(50);
                await job.log('Sending renewal reminder...');
                // await sendRenewalReminder(payload.subscriptionId)
                break;
            default:
                await job.log(`Unknown event type: ${eventType}`);
                throw new Error(`Unsupported event type: ${eventType}`);
        }
        await job.updateProgress(100);
        await job.log(`Event processing completed for ${eventType}`);
        return {
            processed: true,
            eventType,
            eventId,
            processingTime: Date.now() - timestamp,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await job.log(`Event processing failed: ${errorMessage}`);
        throw error;
    }
}
// Scheduled task processor with comprehensive task types
export async function processScheduledTask(job) {
    try {
        const { taskType, userId, metadata } = job.data;
        await job.log(`Executing scheduled task: ${taskType}`);
        await job.updateProgress(10);
        switch (taskType) {
            case 'cleanup_expired_tokens':
                await job.updateProgress(30);
                await job.log('Scanning for expired tokens...');
                // const expiredCount = await cleanupExpiredTokens()
                await job.updateProgress(70);
                await job.log('Tokens cleanup completed');
                break;
            case 'generate_weekly_report':
                await job.updateProgress(25);
                await job.log('Generating weekly report...');
                // const report = await generateReport('weekly', metadata)
                await job.updateProgress(60);
                await job.log('Sending report via email...');
                // await emailReport(userId, report)
                await job.updateProgress(90);
                break;
            case 'backup_database':
                await job.updateProgress(20);
                await job.log('Starting database backup...');
                // await createDatabaseBackup()
                await job.updateProgress(80);
                await job.log('Database backup completed');
                break;
            case 'send_daily_digest':
                await job.updateProgress(30);
                await job.log('Collecting daily activity...');
                // const digest = await createDailyDigest(userId)
                await job.updateProgress(70);
                await job.log('Sending daily digest...');
                // await sendDigestEmail(userId, digest)
                break;
            default:
                throw new Error(`Unknown task type: ${taskType}`);
        }
        await job.updateProgress(100);
        await job.log(`Scheduled task completed: ${taskType}`);
        return {
            completed: true,
            taskType,
            userId,
            metadata,
            completedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await job.log(`Scheduled task failed: ${errorMessage}`);
        throw error;
    }
}
// Hono Integration Helper
export function createJobQueueMiddleware(jobManager) {
    return async (c, next) => {
        c.set('jobManager', jobManager);
        await next();
    };
}
export async function triggerJobFromEvent(jobManager, eventType, payload, options) {
    const jobData = {
        eventType,
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        payload,
        userId: options?.userId,
        timestamp: Date.now(),
    };
    return await jobManager.addJob('events', 'process-event', jobData, {
        delay: options?.delay,
        priority: options?.priority,
    });
}
// Enhanced Saga orchestration
export class SagaOrchestrator {
    jobManager;
    constructor(jobManager) {
        this.jobManager = jobManager;
    }
    async startSaga(sagaType, initialData, steps) {
        const sagaId = `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Create saga coordination job
        await this.jobManager.addJob('sagas', 'saga-coordinator', {
            sagaId,
            sagaType,
            steps,
            currentStep: 0,
            data: initialData,
            status: 'started',
            startedAt: new Date().toISOString(),
        });
        return sagaId;
    }
    async processSagaStep(job) {
        const { sagaId, sagaType, steps, currentStep, data } = job.data;
        try {
            await job.log(`Executing saga step ${currentStep + 1}/${steps.length}: ${steps[currentStep]}`);
            await job.updateProgress((currentStep / steps.length) * 100);
            const stepResult = await this.executeStep(sagaType, steps[currentStep], data, job);
            if (currentStep + 1 < steps.length) {
                await this.jobManager.addJob('sagas', 'saga-coordinator', {
                    sagaId,
                    sagaType,
                    steps,
                    currentStep: currentStep + 1,
                    data: { ...data, ...stepResult },
                    status: 'in-progress',
                });
                await job.log(`Scheduled next step: ${steps[currentStep + 1]}`);
            }
            else {
                await job.updateProgress(100);
                await job.log(`Saga ${sagaId} completed successfully`);
                return { sagaId, status: 'completed', completedAt: new Date().toISOString() };
            }
            return { sagaId, status: 'step-completed', step: steps[currentStep] };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await job.log(`Saga step failed: ${errorMessage}`);
            await this.startCompensation(sagaId, sagaType, currentStep, data, job);
            throw error;
        }
    }
    async executeStep(sagaType, step, data, job) {
        await job.log(`Executing step: ${step}`);
        switch (sagaType) {
            case 'order-processing':
                return await this.executeOrderProcessingStep(step, data, job);
            case 'user-onboarding':
                return await this.executeUserOnboardingStep(step, data, job);
            default:
                throw new Error(`Unknown saga type: ${sagaType}`);
        }
    }
    async executeOrderProcessingStep(step, data, job) {
        switch (step) {
            case 'validate-order':
                await new Promise(resolve => setTimeout(resolve, 200));
                return { validation: 'passed', validatedAt: Date.now() };
            case 'charge-payment':
                await new Promise(resolve => setTimeout(resolve, 300));
                return { paymentId: `pay_${Date.now()}`, charged: true };
            case 'reserve-inventory':
                await new Promise(resolve => setTimeout(resolve, 100));
                return { reservationId: `res_${Date.now()}`, reserved: true };
            case 'send-confirmation':
                await new Promise(resolve => setTimeout(resolve, 150));
                return { confirmationSent: true, sentAt: Date.now() };
            default:
                throw new Error(`Unknown order processing step: ${step}`);
        }
    }
    async executeUserOnboardingStep(step, data, job) {
        switch (step) {
            case 'create-profile':
                await new Promise(resolve => setTimeout(resolve, 200));
                return { profileId: `prof_${Date.now()}`, created: true };
            case 'send-welcome-email':
                await new Promise(resolve => setTimeout(resolve, 100));
                return { welcomeEmailSent: true, sentAt: Date.now() };
            case 'setup-preferences':
                await new Promise(resolve => setTimeout(resolve, 150));
                return { preferencesSetup: true, setupAt: Date.now() };
            default:
                throw new Error(`Unknown user onboarding step: ${step}`);
        }
    }
    async startCompensation(sagaId, sagaType, failedStep, data, job) {
        await job.log(`Starting compensation for saga ${sagaId} at step ${failedStep}`);
        await this.jobManager.addJob('sagas', 'saga-compensation', {
            sagaId,
            sagaType,
            failedStep,
            data,
            status: 'compensating',
            startedAt: new Date().toISOString(),
        });
    }
}
export { Queue, Worker, QueueEvents, Job };
