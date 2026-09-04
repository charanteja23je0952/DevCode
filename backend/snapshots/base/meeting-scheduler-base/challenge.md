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
- If `durationMinutes` is not a positive finite number, return an empty array.

The function should return every available slot in chronological order using the existing response shape.

Do not change the existing API routes or response shape.

## Example

Suppose the existing meetings include:

```js
[
  { start: '10:00', end: '11:00' }
]
```

For a 60-minute meeting, a slot starting at 10:00 is unavailable because it overlaps the existing meeting.

A slot starting at 11:00 is available:

```js
[
  { start: '11:00', end: '12:00' }
]
```

because starting exactly when another meeting ends does not count as an overlap.

All returned slots must use 30-minute start-time increments and must finish by 17:00.

**Note: This is a backend-only challenge, so there is no live preview.**
