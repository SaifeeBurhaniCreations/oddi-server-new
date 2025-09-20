import { app } from "../app.js";
import { testDB } from "../db/aliases.js"
// testDB.seeds();

app.get('/files/list', async (c) => {
    const s3 = c.get('s3');
  });
  