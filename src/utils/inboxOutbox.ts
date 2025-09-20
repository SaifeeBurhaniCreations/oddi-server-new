import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import type { OutboxMessage, InboxMessage } from '@prisma/client'
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

export async function addInboxMessage(
    eventId: string,
    type: string,
    content: object,
    tx: PrismaClient = prisma
): Promise<InboxMessage> {
    return tx.inboxMessage.create({
        data: {
            id: uuidv4(),
            eventId,
            type,
            content,
            receivedOnUtc: new Date()
        }
    })
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
