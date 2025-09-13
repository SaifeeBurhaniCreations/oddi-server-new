export class EventStore {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveEvents(events) {
        await this.prisma.$transaction(async (tx) => {
            for (const event of events) {
                await tx.event.create({
                    data: {
                        id: event.id,
                        type: event.type,
                        aggregateId: event.aggregateId,
                        aggregateType: event.aggregateType,
                        version: event.version,
                        timestamp: event.timestamp,
                        data: event.data,
                        metadata: event.metadata || {}
                    }
                });
            }
        });
    }
    async getEvents(aggregateId, fromVersion) {
        const events = await this.prisma.event.findMany({
            where: {
                aggregateId,
                ...(fromVersion && { version: { gte: fromVersion } })
            },
            orderBy: { version: 'asc' }
        });
        return events.map((event) => ({
            id: event.id,
            type: event.type,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            version: event.version,
            timestamp: event.timestamp,
            data: event.data,
            metadata: event.metadata
        }));
    }
    async getEventsByType(eventType, limit) {
        const events = await this.prisma.event.findMany({
            where: { type: eventType },
            orderBy: { timestamp: 'desc' },
            ...(limit && { take: limit })
        });
        return events.map((event) => ({
            id: event.id,
            type: event.type,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            version: event.version,
            timestamp: event.timestamp,
            data: event.data,
            metadata: event.metadata
        }));
    }
}
