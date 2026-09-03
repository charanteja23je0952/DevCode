import express from 'express';
import { User } from './models/User.js';
import { installInMemoryAdapter } from './db/inMemoryAdapter.js';
import { findDuplicates } from './duplicateFinder.js';

const app = express();
const PORT = 5000;

installInMemoryAdapter(User);

app.get('/api/users', async (_req, res) => {
  const users = await User.find();
  res.json({ users });
});

app.get('/api/users/duplicates', async (_req, res) => {
  const users = await User.find();
  res.json({
    duplicates: findDuplicates(users)
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Duplicate Finder listening on port ${PORT}`);
});
