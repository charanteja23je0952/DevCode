# Meeting Scheduler

A small Express API that reports available meeting start times for a workday.

The service uses a fixed set of existing meetings and calculates which requested time slots are still available.

### Structure

meeting-scheduler-base/
├── README.md
├── challenge.md
└── backend/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── meetings.js
        ├── scheduler.js
        └── server.js

`server.js` exposes the availability endpoint.

`meetings.js` contains the sample schedule.

`scheduler.js` contains the scheduling logic used by the API.

Backend only. No database.

**Note: This is a backend-only challenge, so there is no live preview.**
