import { redis } from "../config/infra/redis.js";

export const eventActions = {
    VendorCreated: {
        db: (payload: any) => { /*DB updates*/ },
        analytics: async (payload: any) => {
            await redis.incr('vendor:count');
        },
        inbox: (payload: any) => { /*Inbox write*/ },
        notification: (payload: any) => { /*Notify*/ },
    },
    VendorUpdated: {
        db: (payload: any) => {},
        analytics: (payload: any) => {},
        inbox: (payload: any) => {},
        notification: (payload: any) => {},
    },
    VendorDeleted: {
        db: (payload: any) => {},
        analytics: (payload: any) => {},
        inbox: (payload: any) => {},
        notification: (payload: any) => {},
    },
};
