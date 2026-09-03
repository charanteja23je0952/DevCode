# Challenge: Meeting Scheduler

The availability endpoint is returning time slots that can conflict with meetings already on the calendar.

Restore the scheduling behavior in:

backend/src/scheduler.js

The scheduling rules are:

- The workday runs from **09:00 through 17:00**.
- Possible meeting start times occur in **30-minute increments** beginning at 09:00.
- A slot must fit completely inside the workday.
- A slot must not overlap an existing meeting.
- A slot that starts exactly when another meeting ends is allowed.

The function should return every available slot in chronological order using the existing response shape.

Do not change the existing API routes or response shape.

**Note: This is a backend-only challenge, so there is no live preview.**
