import { PrismaClient } from '@prisma/client';
import type { Command, Query, DomainEvent, CommandHandler, QueryHandler, EventHandler, ExecutionContext, CommandResult, QueryResult } from '../types/cqrs';
import { EventStore } from './event-store';
export declare class CQRSMediator {
    private prisma;
    private commandHandlers;
    private queryHandlers;
    private eventHandlers;
    private eventStore?;
    constructor(prisma: PrismaClient, eventStore?: EventStore);
    registerCommand<T extends Command>(commandType: string, handler: CommandHandler<T>): void;
    execute<T extends Command>(command: T, context: ExecutionContext): Promise<CommandResult>;
    registerQuery<T extends Query>(queryType: string, handler: QueryHandler<T>): void;
    query<T extends Query>(query: T, context: ExecutionContext): Promise<QueryResult>;
    registerEvent<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
    private publishEvents;
}
//# sourceMappingURL=mediator.d.ts.map