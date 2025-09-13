import type { MiddlewareHandler } from 'hono';
import type { PrismaClient } from '@prisma/client';
import type { DomainEvent } from '../types/cqrs';
import { CQRSMediator } from '../cqrs/mediator';
export interface CQRSConfig {
    prisma: PrismaClient;
    mediator: CQRSMediator;
}
export declare function cqrsMiddleware(config: CQRSConfig): MiddlewareHandler;
export declare function command<T>(type: string, data: Omit<T, 'type' | 'timestamp'>): T & {
    type: string;
    timestamp: Date;
};
export declare function query<T>(type: string, data: Omit<T, 'type'>): T & {
    type: string;
};
export declare function createEvent(type: string, aggregateId: string, aggregateType: string, version: number, data: Record<string, any>, metadata?: Record<string, any>): DomainEvent;
//# sourceMappingURL=cqrs-middleware.d.ts.map