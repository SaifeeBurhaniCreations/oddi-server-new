import type { PrismaClient } from '@prisma/client';
export interface Command {
    readonly type: string;
    readonly timestamp: Date;
    readonly userId?: string;
    readonly metadata?: Record<string, any>;
}
export interface Query {
    readonly type: string;
    readonly filters?: Record<string, any>;
    readonly pagination?: {
        page: number;
        limit: number;
    };
}
export interface DomainEvent {
    readonly id: string;
    readonly type: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly version: number;
    readonly timestamp: Date;
    readonly data: Record<string, any>;
    readonly metadata?: Record<string, any>;
}
export interface CommandHandler<TCommand extends Command, TResult = any> {
    handle(command: TCommand, context: ExecutionContext): Promise<TResult>;
}
export interface QueryHandler<TQuery extends Query, TResult = any> {
    handle(query: TQuery, context: ExecutionContext): Promise<TResult>;
}
export interface EventHandler<TEvent extends DomainEvent> {
    handle(event: TEvent, context: ExecutionContext): Promise<void>;
}
export interface ExecutionContext {
    prisma: PrismaClient;
    userId?: string;
    requestId: string;
    metadata?: Record<string, any>;
}
export interface CommandResult<T = any> {
    success: boolean;
    data?: T;
    events?: DomainEvent[];
    errors?: string[];
}
export interface QueryResult<T = any> {
    data: T;
    metadata?: {
        total?: number;
        page?: number;
        limit?: number;
        executionTime?: number;
    };
}
//# sourceMappingURL=cqrs.d.ts.map