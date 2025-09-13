import type { PrismaClient } from '@prisma/client';
import type { DomainEvent } from '../types/cqrs';
export declare class EventStore {
    private prisma;
    constructor(prisma: PrismaClient);
    saveEvents(events: DomainEvent[]): Promise<void>;
    getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
    getEventsByType(eventType: string, limit?: number): Promise<DomainEvent[]>;
}
//# sourceMappingURL=event-store.d.ts.map