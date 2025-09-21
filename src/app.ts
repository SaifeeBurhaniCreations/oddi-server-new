// Frameworks
import { Hono } from 'hono';

// Core middlewares - external system connectors
import { uploader } from './middlewares/s3FileUpload.js';
import { kafkaMiddleware } from './middlewares/kafka.js';
import { prismaMiddleware } from './middlewares/prisma.js';
import { redisMiddleware } from './middlewares/redis.js';

// Security, logging, rate limiting
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { userJwtAuth } from './middlewares/jwtAuth.js';
import { appRequestLogger } from './middlewares/requestLogger.js';

// CQRS/business logic
import { Cqrs } from './middlewares/cqrs.js';

// Types
import type { Variables } from './types/utils/contextVar.js';

// App infrastructure/startup
import { bootstrap } from './config/infra/kafka.js';

const app = new Hono<{ Variables: Variables }>();

// Kafka bootstrap
(async () => {
    try {
        await bootstrap();
    } catch (err) {
        console.error("Kafka failed to connect, exiting!", err);
        process.exit(1);
    }
})();

// GLOBAL MIDDLEWARES (external systems)
app.use('*', uploader.withS3);
app.use('*', kafkaMiddleware);
app.use('*', prismaMiddleware);
app.use('*', redisMiddleware);

// API-route-specific middlewares
app.use('/api/*', apiRateLimiter);
app.use('/api/*', Cqrs);
app.use('/api/users/*', userJwtAuth);

// Logging
app.use(appRequestLogger);

// ROUTES
app.get('/', (c) => c.text('OddiVille Alive!'));
app.route('/files', uploader.router);

export { app };
