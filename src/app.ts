import { Hono } from 'hono';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { userJwtAuth } from './middlewares/jwtAuth.js';
import { appRequestLogger } from './middlewares/requestLogger.js';
// import { jobManager } from './jobs/jobQueueManager.js';
// import { createJobQueueMiddleware } from './jobs/jobQueueManager.js';

const app = new Hono();

app.get('/', (c) => c.text('OddiVille Alive!'));

// app.use(createJobQueueMiddleware(jobManager));

app.use('/api/*', apiRateLimiter);
app.use('/api/users/*', userJwtAuth);
app.use(appRequestLogger);

export { app };
