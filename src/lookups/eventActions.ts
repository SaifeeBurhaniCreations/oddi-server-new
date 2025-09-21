import { redis } from "../config/infra/redis.js";
import type { AnyNotificationPayload } from "../types/notification.js";

export const eventActions = {
    // Vendor
    VendorCreated: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.incr('analytics:vendor:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    VendorUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    VendorDeleted: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.decr('analytics:vendor:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },

    // Raw Material
    RawMaterialCreated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialDeleted: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },

    // Raw Material Purchase Order
    RawMaterialPurchaseOrderCreated: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.incr('analytics:raw_material_purchase_order:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialPurchaseOrderUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialPurchaseOrderDeleted: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.decr('analytics:raw_material_purchase_order:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialPurchaseOrderCancelled: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialPurchaseOrderReached: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.incr('analytics:production:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    RawMaterialPurchaseOrderPending: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },

    // Production
    ProductionStarted: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ProductionUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ProductionCompleted: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ProductionInQueued: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },

    // Chamber
    ChamberCreated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ChamberUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ChamberDeleted: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    
    // Chamber Stock
    ChamberStockCreated: {
        db: (payload: any) => {},
        analytics: async () => {
            await redis.incr('analytics:chamber_stock:count');
        },
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    ChamberStockUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },

    // Orders
    OrderReady: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    OrderDelivered: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    OrderDispatched: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
    OrderUpdated: {
        db: (payload: any) => {},
        analytics: () => {},
        inbox: (payload: any) => {},
        notification: (payload: AnyNotificationPayload) => {},
    },
};
