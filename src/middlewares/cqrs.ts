import { cqrsMiddleware } from "../sbc/utils/cqrs-kit/middleware/cqrs-middleware.js";
import { prisma } from "../config/prisma.js";
import { mediator } from "../config/db.js"

export const Cqrs = cqrsMiddleware({prisma, mediator})