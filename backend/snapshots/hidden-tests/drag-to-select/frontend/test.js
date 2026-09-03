import assert from 'node:assert/strict';
import { getSelectedItems } from './src/utils/getSelectedItems.js';

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

const items = [
  { id: 'a', left: 10, top: 10, right: 50, bottom: 50 },
  { id: 'b', left: 70, top: 10, right: 110, bottom: 50 },
  { id: 'c', left: 10, top: 70, right: 50, bottom: 110 },
];

test('selects items fully inside the drag rectangle', () => {
  assert.deepEqual(
    getSelectedItems({ left: 0, top: 0, right: 60, bottom: 60 }, items),
    ['a']
  );
});

test('selects items partially crossed by the rectangle', () => {
  assert.deepEqual(
    getSelectedItems({ left: 40, top: 40, right: 80, bottom: 80 }, items),
    ['a', 'b', 'c']
  );
});

test('works when the drag direction is reversed', () => {
  assert.deepEqual(
    getSelectedItems({ left: 80, top: 80, right: 0, bottom: 0 }, items),
    ['a', 'b', 'c']
  );
});

test('does not select an item when the rectangles only touch at an edge', () => {
  assert.deepEqual(
    getSelectedItems({ left: 50, top: 10, right: 70, bottom: 50 }, items),
    []
  );
});

test('returns an empty array when there is no intersection', () => {
  assert.deepEqual(
    getSelectedItems({ left: 120, top: 120, right: 160, bottom: 160 }, items),
    []
  );
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');
