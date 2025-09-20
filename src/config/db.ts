import { PrismaClient } from '@prisma/client'
import { EventStore } from '../sbc/utils/cqrs-kit/cqrs/event-store.js'
import { CQRSMediator } from '../sbc/utils/cqrs-kit/cqrs/mediator.js'
import { ReadModelManager } from '../sbc/utils/cqrs-kit/cqrs/read-model-manager.js'
import { Queue } from 'bullmq'

const prisma = new PrismaClient()
const eventStore = new EventStore(prisma)
export const mediator = new CQRSMediator(prisma, eventStore)
const readModelManager = new ReadModelManager(prisma)
const syncQueue = new Queue('readModelSync')
