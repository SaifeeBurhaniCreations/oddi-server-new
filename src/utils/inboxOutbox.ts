import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import type { OutboxMessage } from '@prisma/client'
import type { InboxMessage } from "../types/inbox.js";

const prisma = new PrismaClient()

export async function addOutboxMessage(
    type: string,
    content: object,
    tx: PrismaClient = prisma
): Promise<OutboxMessage> {
    return tx.outboxMessage.create({
        data: {
            id: uuidv4(),
            type,
            content,
            occurredOnUtc: new Date()
        }
    })
}

export async function markOutboxProcessed(
    id: string,
    error?: string,
    tx: PrismaClient = prisma
): Promise<OutboxMessage> {
    return tx.outboxMessage.update({
        where: { id },
        data: {
            processedOnUtc: new Date(),
            error: error || null
        }
    })
}

export async function insertInboxMessage(payload: InboxMessage) {
    await prisma.$transaction(async (tx) => {
        try {
            await tx.inbox.create({
                data: {
                    id: payload.id,
                    eventId: payload.eventId,
                    eventType: payload.type,
                    content: payload.content,
                    receivedOnUtc: payload.receivedOnUtc,
                    processedOnUtc: payload.processedOnUtc,
                    error: payload.error,
                }
            });
        } catch (err: any) {
            if (err.code === 'P2002') return;
            throw err;
        }
    });
}

export async function markInboxProcessed(
    id: string,
    error?: string,
    tx: PrismaClient = prisma
): Promise<InboxMessage> {
    return tx.inboxMessage.update({
        where: { id },
        data: {
            processedOnUtc: new Date(),
            error: error || null
        }
    })
}
