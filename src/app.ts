import { Hono } from 'hono';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { userJwtAuth } from './middlewares/jwtAuth.js';
import { appRequestLogger } from './middlewares/requestLogger.js';
import { Cqrs } from './middlewares/cqrs.js';
import { uploader } from './middlewares/s3FileUpload.js';
import type { Variables } from './types/utils/contextVar.js';

const app = new Hono<{ Variables: Variables }>();

app.use('*', uploader.withS3);
app.use('/api/*', apiRateLimiter);
app.use('/api/*', Cqrs);
app.use('/api/users/*', userJwtAuth);
app.use(appRequestLogger);

app.get('/', (c) => c.text('OddiVille Alive!'));
app.route('/files', uploader.router);

export { app };
