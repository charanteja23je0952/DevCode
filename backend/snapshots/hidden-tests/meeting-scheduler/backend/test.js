import assert from 'node:assert/strict';
import { findFreeSlots } from './src/scheduler.js';

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

const meetings = [
  { start: '09:30', end: '10:30' },
  { start: '13:30', end: '14:30' },
  { start: '11:30', end: '12:00' }
];

test('returns every non-overlapping 30-minute start slot for the stated workday', () => {
  assert.deepEqual(findFreeSlots(meetings, 60), [
    { start: '10:30', end: '11:30' },
    { start: '12:00', end: '13:00' },
    { start: '12:30', end: '13:30' },
    { start: '14:30', end: '15:30' },
    { start: '15:00', end: '16:00' },
    { start: '15:30', end: '16:30' },
    { start: '16:00', end: '17:00' }
  ]);
});

test('allows a slot to start exactly when a meeting ends', () => {
  const slots = findFreeSlots([{ start: '10:00', end: '11:00' }], 60);
  assert.ok(slots.some((slot) => slot.start === '11:00' && slot.end === '12:00'));
});

test('does not allow a slot that starts during a meeting', () => {
  const slots = findFreeSlots([{ start: '10:00', end: '11:00' }], 60);
  assert.equal(slots.some((slot) => slot.start === '10:30'), false);
});

test('keeps results within 09:00 through 17:00', () => {
  const slots = findFreeSlots([], 120);

  assert.equal(slots[0].start, '09:00');
  assert.equal(slots.at(-1).end, '17:00');
  assert.equal(slots.some((slot) => Number(slot.start.slice(0, 2)) < 9), false);
});

test('handles meetings supplied out of order', () => {
  const slots = findFreeSlots(
    [
      { start: '14:00', end: '15:00' },
      { start: '09:00', end: '10:00' }
    ],
    60
  );

  assert.equal(slots.some((slot) => slot.start === '10:00'), true);
  assert.equal(slots.some((slot) => slot.start === '14:00'), false);
});

test('rejects invalid duration values by returning no slots', () => {
  assert.deepEqual(findFreeSlots([], 0), []);
  assert.deepEqual(findFreeSlots([], -30), []);
  assert.deepEqual(findFreeSlots([], NaN), []);
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');
