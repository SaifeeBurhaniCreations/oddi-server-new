import { app } from "../app.js";
import { eventActions } from "../lookups/eventActions.js";
import { engine } from "../utils/engine.js";
import { createVendorHandler } from '../handlers/createVendorHandler.js';

app.get('/files/list', async (c) => {
  const s3 = c.get('s3');
});

app.post('/vendor/new', async (c) => {
  const payload = await c.req.json();
  await createVendorHandler(payload, c);
  return c.json({ ok: true }, 201);
});



// await engine(eventActions["VendorCreated"], "all", {
//   db: { name: "abcd", users: [] },
//   analytics: { someAnalyticsData: 42 },
//   inbox: { message: "Inbox payload" },
//   notification: { label: "Welcome", title: "Vendor", body: "Created", badge: "🟢" }
// }, {
//   async: true,
//   context: { user: "Admin" }
// });

// await engine(eventActions["VendorCreated"], "notification", {
//   db: { name: "abcd", users: [] },
//   analytics: { someAnalyticsData: 42 },
//   inbox: { message: "Inbox payload" },
//   notification: { label: "Welcome", title: "Vendor", body: "Created", badge: "🟢" }
// }, {
//   onError: (err, key) => console.error(`Handler ${key} failed`, err),
//   context: { user: "Admin" }
// });

// await engine(eventActions["VendorCreated"], ["db", "analytics"], {
//   db: { name: "abcd", users: [] },
//   analytics: { someAnalyticsData: 42 },
//   inbox: { message: "Inbox payload" },
//   notification: { label: "Welcome", title: "Vendor", body: "Created", badge: "🟢" }
// });
