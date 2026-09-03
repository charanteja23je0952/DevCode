const WORKDAY_START = 9 * 60;
const WORKDAY_END = 17 * 60;
const STEP_MINUTES = 30;

export function findFreeSlots(meetings, durationMinutes) {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return [];
  }

  const normalizedMeetings = meetings
    .map((meeting) => ({
      start: toMinutes(meeting.start),
      end: toMinutes(meeting.end)
    }))
    .filter(
      (meeting) =>
        Number.isFinite(meeting.start) &&
        Number.isFinite(meeting.end) &&
        meeting.end > meeting.start
    )
    .sort((a, b) => a.start - b.start);

  const slots = [];

  for (
    let start = WORKDAY_START;
    start + durationMinutes <= WORKDAY_END;
    start += STEP_MINUTES
  ) {
    const end = start + durationMinutes;

    const overlaps = normalizedMeetings.some(
      (meeting) => start < meeting.end && end > meeting.start
    );

    if (!overlaps) {
      slots.push({
        start: formatTime(start),
        end: formatTime(end)
      });
    }
  }

  return slots;
}

function toMinutes(value) {
  if (typeof value !== 'string') return NaN;

  const [hours, minutes] = value.split(':').map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return NaN;
  }

  return hours * 60 + minutes;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
