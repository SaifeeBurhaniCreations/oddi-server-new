import type { Context } from 'hono';
import { prisma } from '../config/infra/prisma.js';

export async function createVendorHandler(payload: any, c: Context) {
    await prisma.$transaction(async (tx) => {
        const vendor = await tx.vendor.create({ data: payload });
        await tx.outbox.create({
            data: {
                type: 'VendorCreated',
                payload: { id: vendor.id, ...payload },
                status: 'pending',
                createdAt: new Date(),
            }
        });
    });
}
