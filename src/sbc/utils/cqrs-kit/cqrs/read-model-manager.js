export class ReadModelManager {
    prisma;
    projections = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    registerProjection(projection) {
        if (!this.projections.has(projection.eventType)) {
            this.projections.set(projection.eventType, []);
        }
        this.projections.get(projection.eventType).push(projection);
    }
    async projectEvent(event, context) {
        const projections = this.projections.get(event.type) || [];
        await Promise.allSettled(projections.map(projection => projection.project(event, context)));
    }
    async rebuildReadModels(eventStore, fromTimestamp) {
        const allEvents = await this.prisma.event.findMany({
            where: fromTimestamp ? { timestamp: { gte: fromTimestamp } } : {},
            orderBy: { timestamp: 'asc' }
        });
        const context = {
            prisma: this.prisma,
            requestId: 'rebuild-' + Date.now()
        };
        for (const eventData of allEvents) {
            const event = {
                id: eventData.id,
                type: eventData.type,
                aggregateId: eventData.aggregateId,
                aggregateType: eventData.aggregateType,
                version: eventData.version,
                timestamp: eventData.timestamp,
                data: eventData.data,
                metadata: eventData.metadata
            };
            await this.projectEvent(event, context);
        }
    }
}
