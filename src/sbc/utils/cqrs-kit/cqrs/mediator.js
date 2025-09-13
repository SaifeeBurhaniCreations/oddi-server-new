export class CQRSMediator {
    prisma;
    commandHandlers = new Map();
    queryHandlers = new Map();
    eventHandlers = new Map();
    eventStore;
    constructor(prisma, eventStore) {
        this.prisma = prisma;
        this.eventStore = eventStore;
    }
    // Command registration and execution
    registerCommand(commandType, handler) {
        this.commandHandlers.set(commandType, handler);
    }
    async execute(command, context) {
        const handler = this.commandHandlers.get(command.type);
        if (!handler) {
            throw new Error(`No handler registered for command: ${command.type}`);
        }
        try {
            const result = await handler.handle(command, context);
            if (result.events?.length) {
                await this.publishEvents(result.events, context);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Command execution failed']
            };
        }
    }
    // Query registration and execution
    registerQuery(queryType, handler) {
        this.queryHandlers.set(queryType, handler);
    }
    async query(query, context) {
        const handler = this.queryHandlers.get(query.type);
        if (!handler) {
            throw new Error(`No handler registered for query: ${query.type}`);
        }
        const startTime = Date.now();
        const result = await handler.handle(query, context);
        const executionTime = Date.now() - startTime;
        return {
            ...result,
            metadata: {
                ...result.metadata,
                executionTime
            }
        };
    }
    registerEvent(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
    }
    async publishEvents(events, context) {
        if (this.eventStore) {
            await this.eventStore.saveEvents(events);
        }
        for (const event of events) {
            const handlers = this.eventHandlers.get(event.type) || [];
            await Promise.allSettled(handlers.map(handler => handler.handle(event, context)));
        }
    }
}
