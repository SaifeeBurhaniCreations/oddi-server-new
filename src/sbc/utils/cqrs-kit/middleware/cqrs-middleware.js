export function cqrsMiddleware(config) {
    return async (c, next) => {
        const context = {
            prisma: config.prisma,
            userId: c.get('user')?.sub,
            requestId: c.get('requestId') || crypto.randomUUID(),
            metadata: {
                userAgent: c.req.header('User-Agent'),
                ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP')
            }
        };
        c.set('cqrsMediator', config.mediator);
        c.set('executionContext', context);
        await next();
    };
}
export function command(type, data) {
    return {
        type,
        timestamp: new Date(),
        ...data
    };
}
export function query(type, data) {
    return {
        type,
        ...data
    };
}
export function createEvent(type, aggregateId, aggregateType, version, data, metadata) {
    return {
        id: crypto.randomUUID(),
        type,
        aggregateId,
        aggregateType,
        version,
        timestamp: new Date(),
        data,
        metadata
    };
}
