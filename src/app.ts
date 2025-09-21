import { Hono } from 'hono';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { userJwtAuth } from './middlewares/jwtAuth.js';
import { appRequestLogger } from './middlewares/requestLogger.js';
import { Cqrs } from './middlewares/cqrs.js';
import { uploader } from './middlewares/s3FileUpload.js';
import type { Variables } from './types/utils/contextVar.js';
import { kafkaMiddleware } from './middlewares/kafka.js';
import { bootstrap } from './config/infra/kafka.js';

const app = new Hono<{ Variables: Variables }>();

(async () => {
    try {
        await bootstrap();
    } catch (err) {
        console.error("Kafka failed to connect, exiting!", err);
        process.exit(1);
    }
})();


app.use('*', uploader.withS3);
app.use('*', kafkaMiddleware);
app.use('/api/*', apiRateLimiter);
app.use('/api/*', Cqrs);
app.use('/api/users/*', userJwtAuth);
app.use(appRequestLogger);

app.get('/', (c) => c.text('OddiVille Alive!'));
app.route('/files', uploader.router);

export { app };
