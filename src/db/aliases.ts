import { prisma } from "../config/seeds.js";

export const testDB = prisma.test as typeof prisma.test & { seeds: () => Promise<void> };
