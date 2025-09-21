export enum NotificationType {
    ProductionStart = "production-start",
    VendorCreated = "vendor-created",
    OrderShipped = "order-shipped",
  }
  
  export interface NotificationJobInput<T = any> {
    type: NotificationType;
    payload: T;
    userId: string;
    notificationId: string;
    scheduleAt?: Date;
  }
  
  export interface NotificationJob<T = any> {
    name: NotificationType;
    data: {
      notificationId: string;
      userId: string;
      type: NotificationType;
      payload: T;
      scheduledAt: string | null;
    };
    opts?: {
      delay?: number;
    };
  }
  