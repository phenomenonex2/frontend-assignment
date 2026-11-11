import express from 'express';
import { fetchDepartmentSummary } from './summary.js';

const PORT = Number(process.env.PORT ?? 3000);

export const app = express();

app.use(express.static(new URL('../public', import.meta.url).pathname));

app.get('/users/summary', async (_req, res) => {
  try {
    res.json(await fetchDepartmentSummary());
  } catch {
    res.status(502).json({ error: 'Failed to fetch users from upstream API' });
  }
});

if (process.argv[1] === import.meta.filename) {
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}
