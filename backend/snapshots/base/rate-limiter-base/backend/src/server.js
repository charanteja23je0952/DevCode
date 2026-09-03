import express from 'express';
import { createRateLimiter } from './rateLimiter.js';

const app = express();
const PORT = 5000;

const checkRateLimit = createRateLimiter({
  limit: 3,
  windowMs: 10_000
});

app.get('/api/ping', (req, res) => {
  const clientId = req.get('x-client-id')?.trim() || 'anonymous';
  const result = checkRateLimit(clientId);

  res.set('X-RateLimit-Remaining', String(result.remaining));

  if (!result.allowed) {
    res.set('Retry-After', String(Math.ceil(result.retryAfterMs / 1000)));
    return res.status(429).json({
      error: 'Too many requests',
      retryAfterMs: result.retryAfterMs
    });
  }

  return res.json({
    ok: true,
    clientId
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Rate Limiter listening on port ${PORT}`);
});
