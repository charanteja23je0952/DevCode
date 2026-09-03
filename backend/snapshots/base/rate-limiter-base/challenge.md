# Challenge: Rate Limiter

The API's per-client limiter occasionally keeps a client blocked longer than the configured window.

Restore the sliding-window behavior in:

backend/src/rateLimiter.js

Expired requests should stop affecting the current window, clients should be tracked independently, and the middleware's existing response behavior should remain unchanged.

Do not add a database or change the API route.

**Note: This is a backend-only challenge, so there is no live preview.**
