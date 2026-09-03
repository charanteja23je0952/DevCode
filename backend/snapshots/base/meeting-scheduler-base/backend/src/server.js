import express from 'express';
import { getMeetingsForDate } from './meetings.js';
import { findFreeSlots } from './scheduler.js';

const app = express();
const PORT = 5000;

app.get('/api/availability', (req, res) => {
  const { date, duration } = req.query;
  const durationMinutes = Number(duration);

  if (!date || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return res.status(400).json({ error: 'date and a positive duration are required' });
  }

  const meetings = getMeetingsForDate(date);
  const slots = findFreeSlots(meetings, durationMinutes);

  return res.json({
    date,
    duration: durationMinutes,
    slots
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Meeting Scheduler listening on port ${PORT}`);
});
