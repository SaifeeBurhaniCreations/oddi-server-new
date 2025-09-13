import { serve } from '@hono/node-server';
import { app } from './app.js';
import { Sentry } from './config/sentry.js';

app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: 'Internal server error' }, 500);
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
