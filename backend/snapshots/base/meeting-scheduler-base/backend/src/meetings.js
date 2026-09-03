const meetings = [
  { id: 1, date: '2026-09-03', title: 'Design review', start: '09:30', end: '10:30' },
  { id: 2, date: '2026-09-03', title: 'Stand-up', start: '11:30', end: '12:00' },
  { id: 3, date: '2026-09-03', title: 'Client call', start: '13:30', end: '14:30' },
  { id: 4, date: '2026-09-04', title: 'Planning', start: '15:00', end: '16:00' }
];

export function getMeetingsForDate(date) {
  return meetings.filter((meeting) => meeting.date === date);
}
