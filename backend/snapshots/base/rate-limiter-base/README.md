# Rate Limiter

A small Express API with per-client request limiting.

The service uses an in-memory sliding window so that each client can make a limited number of requests during the configured time window.

### Structure

rate-limiter-base/
├── README.md
├── challenge.md
└── backend/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── rateLimiter.js
        └── server.js

`server.js` applies the limiter to the API.

`rateLimiter.js` contains the request-window logic.

Backend only. No database.

**Note: This is a backend-only challenge, so there is no live preview.**
