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



// await engine(eventActions["VendorCreated"], "all", {name: "abcd", users: []}, {
//   async: true,
//   beforeEach: (key) => console.log("Running handler:", key),
//   afterEach: (key) => console.log("Finished handler:", key),
//   onError: (err, key) => console.error("Error in", key, err),
//   context: { user: "Admin" }
// });

// await engine(eventActions["VendorCreated"], "notification", {name: "abcd", users: []}, {
//   onError: (err, key) => console.error(`Handler ${key} failed`, err),
//   context: { user: "Admin" }
// });

// await engine(eventActions["VendorCreated"], ["db", "analytics"], {name: "abcd", users: []});
