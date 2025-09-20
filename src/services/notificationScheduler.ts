import { createNotificationJob } from '../factories/notificationFactory.js';
import { NotificationType } from '../models/notification.js';
import { jobQueueManager } from '../queues/jobQueueManager.js';

export async function scheduleProductionStartNotification(args: {
    productionId: string;
    operator: string;
    userId: string;
    notificationId: string;
    scheduleAt?: Date;
}) {
    const job = createNotificationJob({
        type: NotificationType.ProductionStart,
        payload: { productionId: args.productionId, operator: args.operator },
        userId: args.userId,
        notificationId: args.notificationId,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.name, job.data, job.opts);
}
