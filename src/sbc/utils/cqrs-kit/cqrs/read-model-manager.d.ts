import type { PrismaClient } from '@prisma/client';
import type { DomainEvent, ExecutionContext } from '../types/cqrs';
import { EventStore } from './event-store';
export interface ReadModelProjection<T = any> {
    eventType: string;
    project(event: DomainEvent, context: ExecutionContext): Promise<T>;
}
export declare class ReadModelManager {
    private prisma;
    private projections;
    constructor(prisma: PrismaClient);
    registerProjection(projection: ReadModelProjection): void;
    projectEvent(event: DomainEvent, context: ExecutionContext): Promise<void>;
    rebuildReadModels(eventStore: EventStore, fromTimestamp?: Date): Promise<void>;
}
//# sourceMappingURL=read-model-manager.d.ts.map