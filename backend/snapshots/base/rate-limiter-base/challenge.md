# Challenge: Rate Limiter

The API's per-client limiter occasionally keeps a client blocked longer than the configured window.

Restore the sliding-window behavior in:

backend/src/rateLimiter.js

The limiter should:

- Allow up to **3 requests per client within a 1-second window**.
- Track each client independently.
- Remove requests that are no longer inside the current 1-second window before deciding whether a new request is allowed.
- Treat a request exactly at the window boundary as expired.
- Do not record rejected requests as new requests.
- Keep the existing return values and middleware response behavior unchanged.

Do not add a database or change the API route.

## Example

With a 3-request, 1-second window:

```js
let now = 1000;

const limiter = createRateLimiter({
  limit: 3,
  windowMs: 1000,
  now: () => now
});
```

The first three requests from alice are allowed:

```text
t=1000  → allowed
t=1000  → allowed
t=1000  → allowed
```

A fourth request in the same window is rejected:

```text
t=1000  → rejected
```

At t=2000, the request from t=1000 is outside the window, so the next request is allowed.

A request from another client has its own independent window:

```text
alice → tracked separately
bob   → tracked separately
```

**Note: This is a backend-only challenge, so there is no live preview.**
