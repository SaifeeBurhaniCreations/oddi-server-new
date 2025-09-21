import type { UUID } from "./common.js";

// action handlers
export type NotificationHandler =
    | "purchase-ready"
    | "package-comes-to-end"
    | "verify-material"
    | "lane-empty"
    | "product-alert"

// Button/action attached to actionable notifications
export interface NotificationAction {
    label: string;
    value: string;
    url?: string;
    handler?: NotificationHandler;
}

export interface AnyNotificationPayload {
    id: UUID;
    label: string;
    title: string;
    badge: string;
    body: string;
    variant: "actionable" | "informative";
    operator: string;
    actions?: NotificationAction[];
}

export interface AnyNotificationArgs {
    id: UUID;
    operator: string;
    userId: string;
    notificationId: string;
    actions?: NotificationAction[];
    label: string;
    title: string;
    badge: string;
    body: string;
    createdAt: string;
    scheduleAt: string;
}

export enum NotificationType {
    RawMaterialPurchase = "raw-material-purchase",
    RawMaterialReached = "raw-material-reached",
    ProductionStart = "production-start",
    LaneOccupied = "lane-occupied",
    ProductionCompleted = "production-completed",
    OrderReady = "order-ready",
    OrderShipped = "order-shipped",
    OrderReached = "order-reached",
    PackageComesToEnd = "package-comes-to-end",
    WorkerSingle = "worker-single",
    WorkerMultiple = "worker-multiple"
}

export interface NotificationJobInput<Payload = AnyNotificationPayload> {
    type: NotificationType;
    payload: Payload;
    userId: string;
    notificationId: string;
    createdAt: string;
    scheduleAt?: string;
}

export interface NotificationJob<Payload = AnyNotificationPayload> {
    type: NotificationType;
    data: {
        notificationId: string;
        userId: string;
        payload: Payload;
        createdAt: string;
        scheduledAt: string | null;
    };
    opts?: {
        delay?: number;
    };
}