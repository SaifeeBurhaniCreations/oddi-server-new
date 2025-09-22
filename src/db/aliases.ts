import { prisma } from "../config/seeds.js";

export const outboxMessageDB = prisma.outboxMessage as typeof prisma.outboxMessage & { seeds?: () => Promise<void> };
export const inboxMessageDB = prisma.inboxMessage as typeof prisma.inboxMessage & { seeds?: () => Promise<void> };
export const eventDB = prisma.event as typeof prisma.event & { seeds?: () => Promise<void> };
export const userDB = prisma.user as typeof prisma.user & { seeds?: () => Promise<void> };
