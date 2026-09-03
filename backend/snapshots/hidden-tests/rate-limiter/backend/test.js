import assert from 'node:assert/strict';
import { createRateLimiter } from './src/rateLimiter.js';

function test(name, fn) {
  try {
    fn();
    console.log(`PASS - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
}

test('allows requests until the configured limit', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 3,
    windowMs: 1000,
    now: () => now
  });

  assert.deepEqual(limiter('alice'), {
    allowed: true,
    remaining: 2,
    retryAfterMs: 0
  });

  assert.equal(limiter('alice').allowed, true);
  assert.equal(limiter('alice').allowed, true);
  assert.equal(limiter('alice').allowed, false);
});

test('tracks clients independently', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 1,
    windowMs: 1000,
    now: () => now
  });

  assert.equal(limiter('alice').allowed, true);
  assert.equal(limiter('alice').allowed, false);
  assert.equal(limiter('bob').allowed, true);
});

test('expired requests leave the window', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 2,
    windowMs: 1000,
    now: () => now
  });

  limiter('alice');
  limiter('alice');

  now = 2001;

  const result = limiter('alice');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test('a timestamp exactly at the window boundary is expired', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 1,
    windowMs: 1000,
    now: () => now
  });

  limiter('alice');
  now = 2000;

  assert.equal(limiter('alice').allowed, true);
});

test('rejected requests do not extend the window', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 2,
    windowMs: 1000,
    now: () => now
  });

  limiter('alice');
  limiter('alice');
  const rejected = limiter('alice');

  now = 2001;

  assert.equal(rejected.allowed, false);
  assert.equal(limiter('alice').allowed, true);
});

test('retryAfterMs points to the expiry of the oldest active request', () => {
  let now = 1000;
  const limiter = createRateLimiter({
    limit: 2,
    windowMs: 1000,
    now: () => now
  });

  limiter('alice');
  now = 1200;
  limiter('alice');
  const rejected = limiter('alice');

  assert.equal(rejected.retryAfterMs, 800);
  assert.equal(rejected.remaining, 0);
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');
