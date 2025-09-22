import type { Prisma } from "@prisma/client";

export type InboxMessage = {
    id: string;
    eventId: string;
    type: string;
    content: Prisma.JsonValue;
    receivedOnUtc: Date;
    processedOnUtc: Date | null;
    error: string | null;
};
