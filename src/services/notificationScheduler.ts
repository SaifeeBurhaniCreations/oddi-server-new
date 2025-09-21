import { createNotificationJob } from '../factories/notificationFactory.js';
import { NotificationType, type AnyNotificationArgs, type AnyNotificationPayload } from '../types/notification.js';
import { jobQueueManager } from '../queues/jobQueueManager.js';

export async function scheduleRawMaterialPurchaseNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.RawMaterialPurchase,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleRawMaterialReachNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.RawMaterialReached,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleProductionStartNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.ProductionStart,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleLaneOccupiedNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.LaneOccupied,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleProductionCompleteNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.ProductionCompleted,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleOrderReadyNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.OrderReady,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "actionable"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleOrderShippedNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.OrderShipped,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleOrderReachedNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.OrderReached,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function schedulePackageComesToEndNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.PackageComesToEnd,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "actionable"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleWorkerSingleNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.WorkerSingle,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}

export async function scheduleWorkerMultipleNotification(args: AnyNotificationArgs) {
    const job = createNotificationJob<AnyNotificationPayload>({
        type: NotificationType.WorkerMultiple,
        payload: {
            id: args.id,
            operator: args.operator,
            label: args.label,
            title: args.title,
            badge: args.badge,
            body: args.body,
            variant: "informative"
        },
        userId: args.userId,
        notificationId: args.notificationId,
        createdAt: args.createdAt,
        scheduleAt: args.scheduleAt,
    });

    await jobQueueManager.addJob('notifications', job.type, job.data, job.opts);
}