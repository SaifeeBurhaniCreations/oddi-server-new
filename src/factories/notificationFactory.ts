import type { NotificationJobInput, NotificationJob, AnyNotificationPayload } from '../types/notification.js';

export function createNotificationJob<Payload extends AnyNotificationPayload = AnyNotificationPayload>(
    input: NotificationJobInput<Payload>
): NotificationJob<Payload> {
    const { type, payload, userId, notificationId, createdAt, scheduleAt } = input;
    return {
        type,
        data: {
            notificationId,
            userId,
            payload,
            createdAt,
            scheduledAt: scheduleAt || null,
        },
        opts: scheduleAt
            ? { delay: new Date(scheduleAt).getTime() - Date.now() }
            : {},
    };
}
