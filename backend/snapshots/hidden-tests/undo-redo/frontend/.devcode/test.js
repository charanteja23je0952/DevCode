import assert from 'node:assert/strict';
import { createHistoryManager } from '../src/utils/historyManager.js';

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

function action(label, from, to) {
  return {
    label,
    apply: (state) => ({ ...state, value: to }),
    undo: (state) => ({ ...state, value: from })
  };
}

test('starts with no undo or redo history', () => {
  const manager = createHistoryManager({ value: 0 });
  assert.deepEqual(manager.getState(), { value: 0 });
  assert.equal(manager.canUndo(), false);
  assert.equal(manager.canRedo(), false);
  assert.equal(manager.getUndoLabel(), null);
});

test('records actions and exposes the next undo label', () => {
  const manager = createHistoryManager({ value: 0 });
  manager.perform(action("Delete 'Buy milk'", 0, 1));

  assert.deepEqual(manager.getState(), { value: 1 });
  assert.equal(manager.getUndoLabel(), "Undo: Delete 'Buy milk'");
});

test('undo applies the action reverse and exposes redo', () => {
  const manager = createHistoryManager({ value: 0 });
  manager.perform(action('Change value', 0, 1));
  manager.undo();

  assert.deepEqual(manager.getState(), { value: 0 });
  assert.equal(manager.getRedoLabel(), 'Redo: Change value');
  assert.equal(manager.canRedo(), true);
});

test('redo re-applies the same action', () => {
  const manager = createHistoryManager({ value: 0 });
  manager.perform(action('Change value', 0, 1));
  manager.undo();
  manager.redo();

  assert.deepEqual(manager.getState(), { value: 1 });
  assert.equal(manager.canUndo(), true);
  assert.equal(manager.canRedo(), false);
});

test('a new action after undo clears the redo branch', () => {
  const manager = createHistoryManager({ value: 'A' });
  manager.perform(action('Set B', 'A', 'B'));
  manager.perform(action('Set C', 'B', 'C'));
  manager.undo();
  manager.perform(action('Set D', 'B', 'D'));

  assert.deepEqual(manager.getState(), { value: 'D' });
  assert.equal(manager.canRedo(), false);
});

test('history is limited to 50 actions', () => {
  const manager = createHistoryManager({ value: 0 }, { limit: 50 });

  for (let i = 1; i <= 51; i += 1) {
    manager.perform(action(`Set ${i}`, i - 1, i));
  }

  let undoCount = 0;
  while (manager.canUndo()) {
    manager.undo();
    undoCount += 1;
  }

  assert.equal(undoCount, 50);
  assert.deepEqual(manager.getState(), { value: 1 });
});

test('grouped actions undo and redo as one history entry', () => {
  const manager = createHistoryManager([]);

  manager.group('Clear all', () => {
    manager.perform({
      label: "Delete 'A'",
      apply: (state) => state.filter((item) => item !== 'A'),
      undo: (state) => ['A', ...state]
    });
    manager.perform({
      label: "Delete 'B'",
      apply: (state) => state.filter((item) => item !== 'B'),
      undo: (state) => ['B', ...state]
    });
  });

  assert.equal(manager.getUndoLabel(), 'Undo: Clear all');
  assert.deepEqual(manager.getState(), []);

  manager.undo();
  assert.deepEqual(manager.getState(), ['A', 'B']);
  assert.equal(manager.getUndoLabel(), null);
  assert.equal(manager.getRedoLabel(), 'Redo: Clear all');

  manager.redo();
  assert.deepEqual(manager.getState(), []);
});

test('returned state cannot mutate internal history state', () => {
  const manager = createHistoryManager({ items: ['a'] });
  const state = manager.getState();
  state.items.push('b');

  assert.deepEqual(manager.getState(), { items: ['a'] });
});

if (process.exitCode) process.exit(1);
console.log('\nAll tests passed.');
