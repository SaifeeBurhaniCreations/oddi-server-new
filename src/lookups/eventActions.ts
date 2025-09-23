import { redis } from "../config/infra/redis.js";
import { prisma } from "../config/seeds.js";
import type { InboxMessage } from "../types/inbox.js";
import type { AnyNotificationPayload } from "../types/notification.js";
import { insertInboxMessage } from "../utils/inboxOutbox.js";

export const eventActions = {
    // Vendor
    VendorCreated: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.incr('analytics:vendor:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    VendorUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    VendorDeleted: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.decr('analytics:vendor:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Raw Material
    RawMaterialCreated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialDeleted: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Raw Material Purchase Order
    RawMaterialPurchaseOrderCreated: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.incr('analytics:raw_material_purchase_order:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialPurchaseOrderUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialPurchaseOrderDeleted: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.decr('analytics:raw_material_purchase_order:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialPurchaseOrderCancelled: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialPurchaseOrderReached: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.incr('analytics:production:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    RawMaterialPurchaseOrderPending: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Production
    ProductionStarted: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ProductionUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ProductionCompleted: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ProductionInQueued: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Chamber
    ChamberCreated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ChamberUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ChamberDeleted: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Chamber Stock
    ChamberStockCreated: {
        db: (payload: any) => { },
        analytics: async () => {
            await redis.incr('analytics:chamber_stock:count');
        },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    ChamberStockUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },

    // Orders
    OrderReady: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    OrderDelivered: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    OrderDispatched: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
    OrderUpdated: {
        db: (payload: any) => { },
        analytics: () => { },
        inbox: async (payload: InboxMessage) => {
            await insertInboxMessage(payload)
        },
        notification: (payload: AnyNotificationPayload) => { },
    },
}; 
