import type { NotificationJobInput, NotificationJob } from '../models/notification.js';

export function createNotificationJob<T = any>(input: NotificationJobInput<T>): NotificationJob<T> {
    const { type, payload, userId, notificationId, scheduleAt } = input;
    return {
        name: type,
        data: {
            notificationId,
            userId,
            type,
            payload,
            scheduledAt: scheduleAt ? scheduleAt.toISOString() : null,
        },
        opts: scheduleAt
            ? { delay: scheduleAt.getTime() - Date.now() }
            : {},
    };
}
