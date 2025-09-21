import { app } from "../app.js";

app.get('/files/list', async (c) => {
    const s3 = c.get('s3');
  });
  